import { Injectable, OnDestroy } from '@angular/core';
import { RepuxWeb3Service } from '../../services/repux-web3.service';
import { BlockchainTransactionScope } from '../enums/blockchain-transaction-scope';
import { ActionButtonType } from '../enums/action-button-type';
import { StorageService } from '../../services/storage.service';
import { WalletService } from '../../services/wallet.service';
import { Observable, Subscription } from 'rxjs';
import Wallet from '../models/wallet';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { TransactionEvent } from '../models/transaction-event';
import { TransactionEventType } from '../enums/transaction-event-type';
import { TransactionReceipt, TransactionStatus } from 'repux-web3-api';

export interface Transaction {
  transactionHash: string;
  identifier: string;
  scope: BlockchainTransactionScope;
  blocksAction: ActionButtonType;
}

const DroppedTransactionError = 'Transaction dropped';

@Injectable({
  providedIn: 'root'
})
export class TransactionService implements OnDestroy {
  private static readonly STORAGE_KEY = 'TransactionService';

  private trackedTransactionHashes: string[] = [];
  private currentTransactions: Transaction[];
  private walletSubscription: Subscription;
  private wallet: Wallet;
  private droppedTransactions: Transaction[];
  private droppedTransactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private currentTransactionsSubject = new BehaviorSubject<Transaction[]>([]);

  constructor(
    private readonly repuxWeb3Service: RepuxWeb3Service,
    private readonly storageService: StorageService,
    private readonly walletService: WalletService) {
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
  }

  addTransaction(transaction: Transaction): void {
    this.currentTransactions = [ ...this.currentTransactions, transaction ];
    this.trackedTransactionHashes = [ ...this.trackedTransactionHashes, transaction.transactionHash ];
    this.updateStore();
    this.currentTransactionsSubject.next(this.currentTransactions);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.currentTransactionsSubject.asObservable();
  }

  getDroppedTransactions(): Observable<Transaction[]> {
    return this.droppedTransactionsSubject.asObservable();
  }

  async handleTransaction(subject: BehaviorSubject<TransactionEvent>, scope: BlockchainTransactionScope, identifier: string,
                          blocksAction: ActionButtonType, transaction: () => Promise<string>): Promise<void> {
    let transactionHash;
    let transactionObj;

    try {
      subject.next({ type: TransactionEventType.Created });

      transactionHash = await transaction();
      transactionObj = { transactionHash, scope, identifier, blocksAction };

      this.addTransaction(transactionObj);
      subject.next({ type: TransactionEventType.Confirmed });

      const transactionReceipt = await this.getTransactionReceipt(transactionHash);

      if (transactionReceipt.status === TransactionStatus.FAILED) {
        throw new Error('Unknown error');
      }

      this.removeTransaction(transactionObj);
      subject.next({ type: TransactionEventType.Mined, receipt: transactionReceipt });
    } catch (error) {
      console.warn(error);

      if (transactionHash) {
        this.removeTransaction(transactionObj);
      }

      if (error.message === DroppedTransactionError) {
        this.addDroppedTransaction(transactionObj);
        subject.next({ type: TransactionEventType.Dropped, error });
        return;
      }

      subject.next({ type: TransactionEventType.Rejected, error });
    }

    subject.complete();
  }

  async getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt> {
    const web3Service = await this.repuxWeb3Service;
    return (await web3Service.getRepuxApiInstance()).waitForTransactionResult(transactionHash);
  }

  ngOnDestroy() {
    this.walletSubscription.unsubscribe();
  }

  onWalletChange(wallet: Wallet): void {
    if (!wallet || this.wallet === wallet) {
      return;
    }

    this.wallet = wallet;

    const storedData = this.readFromStore();
    this.currentTransactions = storedData.currentTransactions;
    this.droppedTransactions = storedData.droppedTransactions;

    this.currentTransactionsSubject.next(this.currentTransactions);
    this.droppedTransactionsSubject.next(this.droppedTransactions);
    this.currentTransactions.forEach(transaction => this.trackOrphanedTransaction(transaction));
  }

  removeTransaction(transaction: Transaction): void {
    this.currentTransactions = this.currentTransactions
      .filter(_transaction => transaction.transactionHash !== _transaction.transactionHash);
    this.trackedTransactionHashes.splice(this.trackedTransactionHashes.indexOf(transaction.transactionHash), 1);
    this.updateStore();
    this.currentTransactionsSubject.next(this.currentTransactions);
  }

  removeDroppedTransactions(identifier: string) {
    this.droppedTransactions = this.droppedTransactions.filter(transaction => transaction.identifier !== identifier);
    this.updateStore();
    this.droppedTransactionsSubject.next(this.droppedTransactions);
  }

  async trackOrphanedTransaction(transaction: Transaction): Promise<void> {
    if (this.trackedTransactionHashes.includes(transaction.transactionHash)) {
      return;
    }

    this.trackedTransactionHashes = [ ...this.trackedTransactionHashes, transaction.transactionHash ];

    try {
      await this.getTransactionReceipt(transaction.transactionHash);
    } catch (error) {
      if (error === DroppedTransactionError) {
        this.addDroppedTransaction(transaction);
      }
    }

    this.removeTransaction(transaction);
  }

  private addDroppedTransaction(transaction: Transaction) {
    this.droppedTransactions = [ ...this.droppedTransactions, transaction ];
    this.updateStore();
    this.droppedTransactionsSubject.next(this.droppedTransactions);
  }

  private getStorageKey(walletAddress?: string): string {
    return TransactionService.STORAGE_KEY + '_' + (walletAddress ? walletAddress : this.wallet.address);
  }

  private readFromStore(walletAddress?: string): any {
    const saved = this.storageService.getItem(this.getStorageKey(walletAddress));

    if (saved && saved.currentTransactions) {
      return saved;
    }

    const data = { currentTransactions: [], droppedTransactions: [] };
    this.saveToStore(data);

    return data;
  }

  private updateStore(): void {
    this.saveToStore({ currentTransactions: this.currentTransactions, droppedTransactions: this.droppedTransactions });
  }

  private saveToStore(data: { currentTransactions: Transaction[], droppedTransactions: Transaction[] }, walletAddress?: string): void {
    this.storageService.setItem(this.getStorageKey(walletAddress), data);
  }
}
