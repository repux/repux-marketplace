import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { MatDialog } from '@angular/material';
import { DataProductService } from '../../services/data-product.service';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { ClockService } from '../../services/clock.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProductTransaction as BlockchainDataProductTransaction } from 'repux-web3-api';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { AwaitingFinalisationService } from '../services/awaiting-finalisation.service';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';

@Component({
  selector: 'app-marketplace-cancel-purchase-button',
  templateUrl: './marketplace-cancel-purchase-button.component.html',
})
export class MarketplaceCancelPurchaseButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  @Input() blockchainBuyTransaction: BlockchainDataProductTransaction;

  public dataProductAddress: string;
  public wallet: Wallet;
  public isAfterDeliveryDeadline: boolean;
  public isAwaiting: boolean;

  private _clockSubscription: Subscription;
  private _walletSubscription: Subscription;
  private _awaitingFinalisationSubscription: Subscription;
  private _transactionDialogSubscription: Subscription;

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _dialog: MatDialog,
    private _clockService: ClockService,
    private _awaitingFinalisationService: AwaitingFinalisationService,
    private _tagManager: TagManagerService
  ) {
  }

  get userIsBuyer(): boolean {
    return Boolean(this.blockchainBuyTransaction);
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
    this._clockSubscription = this._clockService.onEachSecond().subscribe(date => {
      this.isAfterDeliveryDeadline = this.checkIfAfterDeliveryDeadline(date);
    });
    this._awaitingFinalisationSubscription = this._awaitingFinalisationService.getProducts()
      .subscribe(() => this._checkIfIsAwaiting());
  }

  cancelPurchase() {
    this._tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.CancelPendingTransaction,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    this._unsubscribeTransactionDialog();
    this._transactionDialogSubscription = transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._awaitingFinalisationService.removeProduct(this.dataProduct);
        this.dataProduct.transactions = this.dataProduct.transactions.filter(transaction =>
          transaction.buyerAddress !== this.blockchainBuyTransaction.buyerAddress
        );
        delete this.blockchainBuyTransaction;

        this._tagManager.sendEvent(
          EventCategory.Sell,
          EventAction.CancelPendingTransactionConfirmed,
          this.dataProduct.title,
          this.dataProduct.price ? this.dataProduct.price.toString() : ''
        );
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

  checkIfAfterDeliveryDeadline(date: Date) {
    if (!this.blockchainBuyTransaction) {
      return false;
    }

    return date > this.blockchainBuyTransaction.deliveryDeadline;
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
  }

  private _unsubscribeTransactionDialog() {
    if (this._transactionDialogSubscription) {
      this._transactionDialogSubscription.unsubscribe();
      this._transactionDialogSubscription = null;
    }
  }

  private _checkIfIsAwaiting() {
    this.isAwaiting = Boolean(this._awaitingFinalisationService.findProduct(this.dataProductAddress));
  }
}
