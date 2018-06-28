import { Component, Input } from '@angular/core';
import { DataProduct } from '../data-product';
import { MatDialog } from '@angular/material';
import { DataProductService } from '../services/data-product.service';
import Wallet from '../wallet';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-publish-button',
  templateUrl: './publish-button.component.html',
  styleUrls: [ './publish-button.component.scss' ]
})
export class PublishButtonComponent {
  @Input() dataProduct: DataProduct;
  public dataProductAddress: string;
  public wallet: Wallet;

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
    transactionDialogRef.afterClosed().subscribe(result => {
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
    confirmationDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._unpublishedProductsService.removeProduct(this.dataProduct);
      }
    });
  }
}
