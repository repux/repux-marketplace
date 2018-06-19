import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RepuxLibService } from '../services/repux-lib.service';
import { WalletService } from '../services/wallet.service';
import { DataProductService } from '../services/data-product.service';
import { MatDialog } from '@angular/material';
import { PurchaseConfirmationDialogComponent } from '../purchase-confirmation-dialog/purchase-confirmation-dialog.component';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import Wallet from '../wallet';
import { KeysPasswordDialogComponent } from '../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeyStoreService } from '../key-store/key-store.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-buy-product-button',
  templateUrl: './buy-product-button.component.html',
  styleUrls: [ './buy-product-button.component.scss' ]
})
export class BuyProductButtonComponent implements OnInit, OnDestroy {
  @Input() productAddress: string;
  @Input() productOwnerAddress: string;
  private _subscription: Subscription;
  public wallet: Wallet;
  public boughtProducts: string[] = [];
  public approvedProducts: string[] = [];

  constructor(
    private _dataProductService: DataProductService,
    private _repuxLibService: RepuxLibService,
    private _walletService: WalletService,
    private _keyStoreService: KeyStoreService,
    private _dialog: MatDialog) {
  }

  ngOnInit(): void {
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  async getBoughtProducts(): Promise<void> {
    this.boughtProducts = await this._dataProductService.getBoughtDataProducts();
  }

  async getApprovedProducts(): Promise<void> {
    this.approvedProducts = await this._dataProductService.getBoughtAndApprovedDataProducts();
  }

  private _onWalletChange(wallet: Wallet): void {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.getBoughtProducts();
    this.getApprovedProducts();
  }

  async buyDataProduct(): Promise<void> {
    const { publicKey } = await this._getKeys();
    const serializedKey = await this._repuxLibService.getClass().serializePublicKey(publicKey);

    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.boughtProducts.push(this.productAddress);
        this._dialog.open(PurchaseConfirmationDialogComponent);
      }
    });
    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.purchaseDataProduct(this.productAddress, serializedKey);
    transactionDialog.callTransaction();
  }

  get approved() {
    return this.approvedProducts && this.approvedProducts.includes(this.productAddress);
  }

  get bought() {
    return this.boughtProducts && this.boughtProducts.includes(this.productAddress);
  }

  get userIsOwner() {
    return this.wallet && this.wallet.address === this.productOwnerAddress;
  }

  private _getKeys(): Promise<{ privateKey: JsonWebKey, publicKey: JsonWebKey }> {
    return new Promise(resolve => {
      let dialogRef;

      if (this._keyStoreService.hasKeys()) {
        dialogRef = this._dialog.open(KeysPasswordDialogComponent);
      } else {
        dialogRef = this._dialog.open(KeysGeneratorDialogComponent);
      }

      this._subscription = dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve({
            privateKey: result.privateKey,
            publicKey: result.publicKey
          });
        }
      });
    });
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
