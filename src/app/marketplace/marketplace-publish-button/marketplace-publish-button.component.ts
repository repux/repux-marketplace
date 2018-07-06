import { Component, Input, OnDestroy } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { MatDialog } from '@angular/material';
import { DataProductService } from '../../services/data-product.service';
import Wallet from '../../shared/models/wallet';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { UnpublishedProductsService } from '../../services/unpublished-products.service';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-marketplace-publish-button',
  templateUrl: './marketplace-publish-button.component.html',
  styleUrls: [ './marketplace-publish-button.component.scss' ]
})
export class MarketplacePublishButtonComponent implements OnDestroy {
  @Input() dataProduct: DataProduct;
  public dataProductAddress: string;
  public wallet: Wallet;

  private _transactionDialogSubscription: Subscription;
  private _unpublishedProductsSubscription: Subscription;
  private _products: DataProduct[];

  constructor(
    private _unpublishedProductsService: UnpublishedProductsService,
    private _dataProductService: DataProductService,
    private _dialog: MatDialog
  ) {
    this._unpublishedProductsSubscription = this._unpublishedProductsService.getProducts().subscribe(products => this._products = products);
  }

  get isUnpublished() {
    return this._products.find(dataProduct => dataProduct.sellerMetaHash === this.dataProduct.sellerMetaHash);
  }

  async publish() {
    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    this._unsubscribeTransactionDialog();
    this._transactionDialogSubscription = transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._unpublishedProductsService.removeProduct(this.dataProduct);
      }
    });
    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.publishDataProduct(
      this.dataProduct.sellerMetaHash,
      this.dataProduct.price,
      this.dataProduct.daysForDeliver
    );

    await transactionDialog.callTransaction();
  }

  remove() {
    const confirmationDialogRef = this._dialog.open(ConfirmationDialogComponent, {
      disableClose: true
    });
    confirmationDialogRef.componentInstance.title = 'Removing marketplace-sell-unpublished file';
    confirmationDialogRef.componentInstance.body = `Are you sure you want to delete product ${this.dataProduct.name}?`;
    this._unsubscribeTransactionDialog();
    this._transactionDialogSubscription = confirmationDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._unpublishedProductsService.removeProduct(this.dataProduct);
      }
    });
  }

  ngOnDestroy() {
    this._unsubscribeTransactionDialog();

    if (this._unpublishedProductsSubscription) {
      this._unpublishedProductsSubscription.unsubscribe();
    }
  }

  private _unsubscribeTransactionDialog() {
    if (this._transactionDialogSubscription) {
      this._transactionDialogSubscription.unsubscribe();
      this._transactionDialogSubscription = null;
    }
  }
}
