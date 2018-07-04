import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { MatDialog } from '@angular/material';
import { DataProductService } from '../../services/data-product.service';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { ClockService } from '../../services/clock.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProductTransaction } from '../../shared/models/data-product-transaction';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { DataProductNotificationsService } from '../../services/data-product-notifications.service';

@Component({
  selector: 'app-marketplace-cancel-purchase-button',
  templateUrl: './marketplace-cancel-purchase-button.component.html',
})
export class MarketplaceCancelPurchaseButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  public dataProductAddress: string;
  public wallet: Wallet;
  public userIsBuyer: boolean;
  public isAfterDeliveryDeadline: boolean;
  public isAwaiting: boolean;

  private _clockSubscription: Subscription;
  private _walletSubscription: Subscription;
  private _awaitingFinalisationSubscription: Subscription;
  private _transactionDialogSubscription: Subscription;
  private _transaction: DataProductTransaction;

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _dialog: MatDialog,
    private _clockService: ClockService,
    private _dataProductNotificationsService: DataProductNotificationsService
  ) {
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
    this._clockSubscription = this._clockService.onEachSecond().subscribe(date => this._checkIfAfterDeliveryDeadline(date));
    this._awaitingFinalisationSubscription = this._dataProductNotificationsService.getAwaitingFinalisation()
      .subscribe(() => this._checkIfIsAwaiting());
  }

  getUserIsBuyer(): boolean {
    return Boolean(this._transaction);
  }

  cancelPurchase() {
    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    this._unsubscribeTransactionDialog();
    this._transactionDialogSubscription = transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._dataProductNotificationsService.removeAwaitingFinalisation({
          dataProductAddress: this.dataProductAddress,
          buyerAddress: this.wallet.address
        });
        this._dataProductNotificationsService.removeBoughtProductAddress(this.dataProductAddress);
        this.dataProduct.transactions = this.dataProduct.transactions.filter(transaction => transaction !== this._transaction);
        this._transaction = null;
      }
    });
    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.cancelDataProductPurchase(this.dataProductAddress);
    transactionDialog.callTransaction();
  }

  ngOnDestroy() {
    if (this._clockSubscription) {
      this._clockSubscription.unsubscribe();
    }

    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }

    if (this._awaitingFinalisationSubscription) {
      this._awaitingFinalisationSubscription.unsubscribe();
    }

    this._unsubscribeTransactionDialog();
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this._transaction = this._findTransactionByCurrentBuyerAddress();
    this.userIsBuyer = this.getUserIsBuyer();
  }

  private _findTransactionByCurrentBuyerAddress(): DataProductTransaction {
    if (!this.wallet.address) {
      return;
    }

    return this.dataProduct.transactions.find(transaction => transaction.buyerAddress === this.wallet.address);
  }

  private _checkIfAfterDeliveryDeadline(date: Date) {
    if (!this._transaction) {
      this.isAfterDeliveryDeadline = false;
      return;
    }

    this.isAfterDeliveryDeadline = date > this._transaction.deliveryDeadline;
  }

  private _unsubscribeTransactionDialog() {
    if (this._transactionDialogSubscription) {
      this._transactionDialogSubscription.unsubscribe();
      this._transactionDialogSubscription = null;
    }
  }

  private _checkIfIsAwaiting() {
    this.isAwaiting = this._dataProductNotificationsService.findAwaitingFinalisation({
      dataProductAddress: this.dataProductAddress,
      buyerAddress: this.wallet.address
    });
  }
}
