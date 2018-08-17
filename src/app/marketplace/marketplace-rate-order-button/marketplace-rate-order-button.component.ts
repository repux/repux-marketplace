import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataProductOrder as BlockchainDataProductOrder, TransactionStatus, TransactionReceipt } from 'repux-web3-api';
import { ClockService } from '../../services/clock.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';
import BigNumber from 'bignumber.js';
import { DataProductService } from '../../services/data-product.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { MarketplaceRateOrderDialogComponent } from '../marketplace-rate-order-dialog/marketplace-rate-order-dialog.component';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';

@Component({
  selector: 'app-marketplace-rate-order-button',
  templateUrl: './marketplace-rate-order-button.component.html'
})
export class MarketplaceRateOrderButtonComponent implements OnDestroy, OnInit {
  @Input() dataProduct;
  @Input() blockchainDataProductOrder: BlockchainDataProductOrder;

  public pendingTransaction: Transaction;
  public selectedRating: BigNumber;

  private date: Date;
  private dialogSubscription: Subscription;
  private transactionsSubscription: Subscription;
  private clockSubscription: Subscription;

  constructor(
    private clockService: ClockService,
    private matDialog: MatDialog,
    private dataProductService: DataProductService,
    private commonDialogService: CommonDialogService,
    private transactionService: TransactionService
  ) {
  }

  get rating(): BigNumber {
    if (!this.blockchainDataProductOrder) {
      return null;
    }

    return this.blockchainDataProductOrder.rating;
  }

  get canRate(): boolean {
    if (!this.rating || !this.rating.isZero()) {
      return false;
    }

    return this.blockchainDataProductOrder.finalised && this.date <= this.blockchainDataProductOrder.rateDeadline;
  }

  ngOnInit() {
    this.clockSubscription = this.clockService.onEachSecond().subscribe(date => this.date = date);
    this.transactionsSubscription = this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
  }

  onTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      this.blockchainDataProductOrder.rating = this.selectedRating;
    }

    delete this.pendingTransaction;
  }

  async onTransactionsListChange(transactions: Transaction[]) {
    const foundTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this.dataProduct.address &&
      transaction.blocksAction === ActionButtonType.Rate
    );

    if (this.pendingTransaction && !foundTransaction) {
      this.onTransactionFinish(
        await this.transactionService.getTransactionReceipt(this.pendingTransaction.transactionHash)
      );
    } else {
      this.pendingTransaction = foundTransaction;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeDialogSubscription();

    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }

    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  onDialogSubscriptionClose(result): void {
    this.unsubscribeDialogSubscription();

    if (!result) {
      return;
    }

    return this.saveRating(result);
  }

  rateOrder(): void {
    if (!this.canRate) {
      return;
    }

    this.unsubscribeDialogSubscription();

    this.dialogSubscription = this.matDialog.open(MarketplaceRateOrderDialogComponent).afterClosed()
      .subscribe(result => this.onDialogSubscriptionClose(result));
  }

  saveRating(rating: BigNumber): void {
    if (!this.canRate) {
      return;
    }

    this.selectedRating = rating;

    this.commonDialogService.transaction(
      () => this.dataProductService.rateDataProductPurchase(this.dataProduct.address, rating)
    );
  }

  unsubscribeDialogSubscription() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }
}
