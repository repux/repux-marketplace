import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RepuxLibService } from '../../services/repux-lib.service';
import { WalletService } from '../../services/wallet.service';
import { DataProductService } from '../../services/data-product.service';
import { MatDialog } from '@angular/material';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import Wallet from '../../shared/models/wallet';
import { KeysPasswordDialogComponent } from '../../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeyStoreService } from '../../key-store/key-store.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProduct } from '../../shared/models/data-product';
import {
  MarketplacePurchaseConfirmationDialogComponent
} from '../marketplace-purchase-confirmation-dialog/marketplace-purchase-confirmation-dialog.component';
import { DataProductNotificationsService } from '../../services/data-product-notifications.service';

@Component({
  selector: 'app-marketplace-buy-product-button',
  templateUrl: './marketplace-buy-product-button.component.html',
  styleUrls: [ './marketplace-buy-product-button.component.scss' ]
})
export class MarketplaceBuyProductButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  public wallet: Wallet;
  public finalised: boolean;
  public bought: boolean;
  public userIsOwner: boolean;
  public dataProductAddress: string;
  public productOwnerAddress: string;
  private _keysSubscription: Subscription;
  private _walletSubscription: Subscription;
  private _transactionDialogSubscription: Subscription;

  constructor(
    private _dataProductService: DataProductService,
    private _repuxLibService: RepuxLibService,
    private _walletService: WalletService,
    private _keyStoreService: KeyStoreService,
    private _dataProductNotificationsService: DataProductNotificationsService,
    private _dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.dataProductAddress = this.dataProduct.address;
    this.productOwnerAddress = this.dataProduct.ownerAddress;
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  async buyDataProduct(): Promise<void> {
    const { publicKey } = await this._getKeys();
    const serializedKey = await this._repuxLibService.getInstance().serializePublicKey(publicKey);

    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    this._unsubscribeTransactionDialog();
    this._transactionDialogSubscription = transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bought = true;
        this._dataProductNotificationsService.addBoughtProductAddress(this.dataProductAddress);
        this._dialog.open(MarketplacePurchaseConfirmationDialogComponent);
      }
    });
    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.purchaseDataProduct(this.dataProductAddress, serializedKey);
    transactionDialog.callTransaction();
  }

  getFinalised() {
    return this.dataProduct.transactions
      .filter(transaction => transaction.buyerAddress === this.wallet.address && transaction.finalised).length > 0;
  }

  getBought() {
    return this.dataProduct.transactions
      .filter(transaction => transaction.buyerAddress === this.wallet.address).length > 0;
  }

  getUserIsOwner() {
    return this.wallet && this.wallet.address === this.productOwnerAddress;
  }

  ngOnDestroy() {
    if (this._keysSubscription) {
      this._keysSubscription.unsubscribe();
    }

    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }

    this._unsubscribeTransactionDialog();
  }

  private _onWalletChange(wallet: Wallet): void {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
    this.finalised = this.getFinalised();
    this.bought = this.getBought();
  }

  private _getKeys(): Promise<{ privateKey: JsonWebKey, publicKey: JsonWebKey }> {
    return new Promise(resolve => {
      let dialogRef;

      if (this._keyStoreService.hasKeys()) {
        dialogRef = this._dialog.open(KeysPasswordDialogComponent);
      } else {
        dialogRef = this._dialog.open(KeysGeneratorDialogComponent);
      }

      this._keysSubscription = dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve({
            privateKey: result.privateKey,
            publicKey: result.publicKey
          });
        }
      });
    });
  }

  private _unsubscribeTransactionDialog() {
    if (this._transactionDialogSubscription) {
      this._transactionDialogSubscription.unsubscribe();
      this._transactionDialogSubscription = null;
    }
  }
}
