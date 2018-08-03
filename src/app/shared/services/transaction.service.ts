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
import { TransactionReceipt } from 'repux-web3-api';

export interface Transaction {
  transactionHash: string;
  identifier: string;
  scope: BlockchainTransactionScope;
  blocksAction: ActionButtonType;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService implements OnDestroy {
  private static readonly STORAGE_KEY = 'TransactionService';

  private currentTransactions: Transaction[];
  private walletSubscription: Subscription;
  private wallet: Wallet;
  private currentTransactionsSubject = new BehaviorSubject<Transaction[]>([]);

  constructor(
    private readonly repuxWeb3Service: RepuxWeb3Service,
    private readonly storageService: StorageService,
    private readonly walletService: WalletService) {
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
  }

  addTransaction(transaction: Transaction): void {
    this.currentTransactions = [ ...this.currentTransactions, transaction ];
    this.saveToStore(this.currentTransactions);
    this.currentTransactionsSubject.next(this.currentTransactions);
  }

  getTransactions(): Observable<Transaction[]> {
    return this.currentTransactionsSubject.asObservable();
  }

  async handleTransaction(subject: BehaviorSubject<TransactionEvent>, scope: BlockchainTransactionScope, identifier: string,
                          blocksAction: ActionButtonType, transaction: () => Promise<string>): Promise<void> {
    try {
      subject.next({ type: TransactionEventType.Created });

      const transactionHash = await transaction();
      this.addTransaction({ transactionHash, scope, identifier, blocksAction });
      subject.next({ type: TransactionEventType.Confirmed });

      const transactionReceipt = await this.getTransactionReceipt(transactionHash);
      this.removeTransaction({ transactionHash, scope, identifier, blocksAction });
      subject.next({ type: TransactionEventType.Mined, receipt: transactionReceipt });
    } catch (error) {
      console.warn(error);
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
    if (!wallet && this.wallet === wallet) {
      return;
    }

    this.wallet = wallet;
    this.currentTransactions = this.readFromStore();
    this.currentTransactionsSubject.next(this.currentTransactions);
  }

  removeTransaction(transaction: Transaction): void {
    this.currentTransactions = this.currentTransactions
      .filter(_transaction => transaction.transactionHash !== _transaction.transactionHash);
    this.saveToStore(this.currentTransactions);
    this.currentTransactionsSubject.next(this.currentTransactions);
  }

  private getStorageKey(walletAddress?: string): string {
    return TransactionService.STORAGE_KEY + '_' + (walletAddress ? walletAddress : this.wallet.address);
  }

  private readFromStore(walletAddress?: string): any {
    const saved = this.storageService.getItem(this.getStorageKey(walletAddress));

    if (saved) {
      return saved;
    }

    const data = [];
    this.saveToStore(data);

    return data;
  }

  private saveToStore(data: any, walletAddress?: string): void {
    this.storageService.setItem(this.getStorageKey(walletAddress), data);
  }
}
