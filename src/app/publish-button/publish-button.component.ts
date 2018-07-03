import { Component, Input, OnDestroy } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { MatDialog } from '@angular/material';
import { DataProductService } from '../services/data-product.service';
import Wallet from '../shared/models/wallet';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-publish-button',
  templateUrl: './publish-button.component.html',
  styleUrls: [ './publish-button.component.scss' ]
})
export class PublishButtonComponent implements OnDestroy {
  @Input() dataProduct: DataProduct;
  public dataProductAddress: string;
  public wallet: Wallet;

  private _transactionDialogSubscription: Subscription;

  constructor(
    private _unpublishedProductsService: UnpublishedProductsService,
    private _dataProductService: DataProductService,
    private _dialog: MatDialog
  ) {
  }

  get isUnpublished() {
    return this._unpublishedProductsService.products.find(dataProduct => dataProduct.sellerMetaHash === this.dataProduct.sellerMetaHash);
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
    confirmationDialogRef.componentInstance.title = 'Removing unpublished file';
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
  }

  private _unsubscribeTransactionDialog() {
    if (this._transactionDialogSubscription) {
      this._transactionDialogSubscription.unsubscribe();
      this._transactionDialogSubscription = null;
    }
  }
}
