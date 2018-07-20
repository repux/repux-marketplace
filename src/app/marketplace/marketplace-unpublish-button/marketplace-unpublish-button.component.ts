import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { MatDialog } from '@angular/material';
import { DataProductService } from '../../services/data-product.service';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProduct as BlockchainDataProduct } from 'repux-web3-api';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { UnpublishedProductsService } from '../services/unpublished-products.service';

@Component({
  selector: 'app-marketplace-unpublish-button',
  templateUrl: './marketplace-unpublish-button.component.html',
  styleUrls: [ './marketplace-unpublish-button.component.scss' ]
})
export class MarketplaceUnpublishButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  @Input() blockchainDataProduct: BlockchainDataProduct;

  public dataProductAddress: string;
  public wallet: Wallet;
  public userIsOwner: boolean;

  private _walletSubscription: Subscription;

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _dialog: MatDialog,
    private _tagManager: TagManagerService,
    private unpublishedProductsService: UnpublishedProductsService
  ) {
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  getUserIsOwner(): boolean {
    return this.wallet.address === this.dataProduct.ownerAddress;
  }

  unpublish() {
    this._tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.UnpublishButton,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addProductToUnpublishedProducts(this.dataProduct);
        this.blockchainDataProduct.disabled = true;
        this._tagManager.sendEvent(
          EventCategory.Sell,
          EventAction.UnpublishConfirmed,
          this.dataProduct.title,
          this.dataProduct.price ? this.dataProduct.price.toString() : ''
        );
      }
    });
    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.disableDataProduct(this.dataProductAddress);
    transactionDialog.callTransaction();
  }

  ngOnDestroy() {
    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }
  }

  addProductToUnpublishedProducts(dataProduct: DataProduct): void {
    const product = Object.assign({}, dataProduct);
    delete product.address;
    delete product.blockchainState;
    delete product.transactions;

    this.unpublishedProductsService.addProduct(product);
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }
}
