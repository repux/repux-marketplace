import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import BigNumber from 'bignumber.js';
import { DataProductService } from '../../services/data-product.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { DataProduct as BlockchainDataProduct, TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { TransactionEventType } from '../../shared/enums/transaction-event-type';
import { CommonDialogService } from '../../shared/services/common-dialog.service';

@Component({
  selector: 'app-marketplace-withdraw-button',
  templateUrl: './marketplace-withdraw-button.component.html',
  styleUrls: [ './marketplace-withdraw-button.component.scss' ]
})
export class MarketplaceWithdrawButtonComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dataProduct: DataProduct;
  @Input() blockchainDataProduct: BlockchainDataProduct;

  public dataProductAddress: string;
  public wallet: Wallet;
  public userIsOwner: boolean;
  public fundsToWithdraw = new BigNumber(0);
  public pendingTransaction: Transaction;

  private walletSubscription: Subscription;
  private transactionsSubscription: Subscription;

  constructor(
    private walletService: WalletService,
    private dataProductService: DataProductService,
    private tagManager: TagManagerService,
    private transactionService: TransactionService,
    private commonDialogService: CommonDialogService
  ) {
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
    this.transactionsSubscription = this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
  }

  onTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      this.fundsToWithdraw = new BigNumber(0);
      this.tagManager.sendEvent(
        EventCategory.Sell,
        EventAction.WithdrawConfirmed,
        this.dataProduct.title,
        this.dataProduct.fundsToWithdraw ? this.dataProduct.fundsToWithdraw.toString() : ''
      );
    }
  }

  async onTransactionsListChange(transactions: Transaction[]) {
    const foundTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this.dataProductAddress &&
      transaction.blocksAction === ActionButtonType.Withdraw
    );

    if (this.pendingTransaction && !foundTransaction) {
      this.onTransactionFinish(
        await this.transactionService.getTransactionReceipt(this.pendingTransaction.transactionHash)
      );
    }

    this.pendingTransaction = foundTransaction;
  }

  ngOnChanges() {
    if (this.blockchainDataProduct) {
      this.fundsToWithdraw = this.blockchainDataProduct.fundsAccumulated.minus(this.blockchainDataProduct.buyersDeposit);
    }
  }

  getUserIsOwner(): boolean {
    return this.wallet.address === this.dataProduct.ownerAddress;
  }

  withdraw() {
    this.tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.Withdraw,
      this.dataProduct.title,
      this.dataProduct.fundsToWithdraw ? this.dataProduct.fundsToWithdraw.toString() : ''
    );

    this.commonDialogService.transaction(
      () => this.dataProductService.withdrawFundsFromDataProduct(this.dataProductAddress)
    );
  }

  ngOnDestroy() {
    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }

    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }

  private onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }
}
