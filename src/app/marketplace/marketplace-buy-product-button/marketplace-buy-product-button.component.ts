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
import { AwaitingFinalisationService } from '../services/awaiting-finalisation.service';
import { DataProductTransaction as BlockchainDataProductTransaction } from 'repux-web3-api';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { TransactionResult } from 'repux-web3-api/repux-web3-api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-marketplace-buy-product-button',
  templateUrl: './marketplace-buy-product-button.component.html',
  styleUrls: [ './marketplace-buy-product-button.component.scss' ]
})
export class MarketplaceBuyProductButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  @Input() blockchainBuyTransaction: BlockchainDataProductTransaction;

  public wallet: Wallet;
  public userIsOwner: boolean;
  public dataProductAddress: string;
  public productOwnerAddress: string;
  private _keysSubscription: Subscription;
  private _walletSubscription: Subscription;
  private _transactionDialogSubscription: Subscription;

  constructor(
    private _tagManager: TagManagerService,
    private _dataProductService: DataProductService,
    private _repuxLibService: RepuxLibService,
    private _walletService: WalletService,
    private _keyStoreService: KeyStoreService,
    private _awaitingFinalisationService: AwaitingFinalisationService,
    private _dialog: MatDialog) {
  }

  get finalised() {
    return this.blockchainBuyTransaction && this.blockchainBuyTransaction.finalised;
  }

  get bought() {
    return this.blockchainBuyTransaction && this.blockchainBuyTransaction.purchased;
  }

  ngOnInit(): void {
    this.dataProductAddress = this.dataProduct.address;
    this.productOwnerAddress = this.dataProduct.ownerAddress;
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  async buyDataProduct(): Promise<void> {
    this._tagManager.sendEvent(
      EventCategory.Buy,
      EventAction.Buy,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    const { publicKey } = await this._getKeys();
    const serializedKey = await this._repuxLibService.getInstance().serializePublicKey(publicKey);

    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    this._unsubscribeTransactionDialog();
    this._transactionDialogSubscription = transactionDialogRef.afterClosed().subscribe((result: TransactionResult) => {
      if (result) {
        this.blockchainBuyTransaction = {
          purchased: true
        };
        this._awaitingFinalisationService.addProduct(this.dataProduct);
        this._dialog.open(MarketplacePurchaseConfirmationDialogComponent);
        this.emitBuyConfirmedEvent(result);
      }
    });
    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.purchaseDataProduct(this.dataProductAddress, serializedKey);
    transactionDialog.callTransaction();
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

  private emitBuyConfirmedEvent(result: TransactionResult): void {
    this._tagManager.sendEvent(
      EventCategory.Buy,
      EventAction.BuyConfirmed,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : '',
      result.gasUsed,
      {
        currencyCode: environment.analyticsCurrencySubstitute,
        originalCurrency: environment.repux.currency.defaultName,
        purchase: {
          actionField: {
            id: result.transactionHash,
            revenue: this.dataProduct.price.toString(),
          },
          products: [ {
            id: result.address,
            name: this.dataProduct.title,
            brand: this.dataProduct.ownerAddress,
            category: this.dataProduct.category.join(', '),
            price: this.dataProduct.price.toString(),
            quantity: 1
          } ]
        }
      }
    );
  }

  private _onWalletChange(wallet: Wallet): void {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
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
