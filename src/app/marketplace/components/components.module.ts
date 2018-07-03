import { BuyProductButtonComponent } from './buy-product-button/buy-product-button.component';
import { NgModule } from '@angular/core';
import { CancelPurchaseButtonComponent } from './cancel-purchase-button/cancel-purchase-button.component';
import { DataProductListComponent } from './data-product-list/data-product-list.component';
import { DataProductTransactionsListComponent } from './data-product-transactions-list/data-product-transactions-list.component';
import { DataProductListDetailDirective } from './data-product-list/data-product-list-detail.directive';
import { DownloadProductButtonComponent } from './download-product-button/download-product-button.component';
import { FinaliseButtonComponent } from './finalise-button/finalise-button.component';
import { ProductCategorySelectorComponent } from './product-category-selector/product-category-selector.component';
import { ProductCreatorDialogComponent } from './product-creator-dialog/product-creator-dialog.component';
import { PublishButtonComponent } from './publish-button/publish-button.component';
import { PurchaseConfirmationDialogComponent } from './purchase-confirmation-dialog/purchase-confirmation-dialog.component';
import { UnpublishButtonComponent } from './unpublish-button/unpublish-button.component';
import { WithdrawButtonComponent } from './withdraw-button/withdraw-button.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material.module';
import { AppRoutingModule } from '../../app-routing.module';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ],
  declarations: [
    BuyProductButtonComponent,
    CancelPurchaseButtonComponent,
    DataProductListComponent,
    DataProductListDetailDirective,
    DataProductTransactionsListComponent,
    DownloadProductButtonComponent,
    FinaliseButtonComponent,
    ProductCategorySelectorComponent,
    ProductCreatorDialogComponent,
    PublishButtonComponent,
    PurchaseConfirmationDialogComponent,
    UnpublishButtonComponent,
    WithdrawButtonComponent
  ],
  exports: [
    BuyProductButtonComponent,
    CancelPurchaseButtonComponent,
    DataProductListComponent,
    DataProductListDetailDirective,
    DataProductTransactionsListComponent,
    DownloadProductButtonComponent,
    FinaliseButtonComponent,
    ProductCategorySelectorComponent,
    ProductCreatorDialogComponent,
    PublishButtonComponent,
    PurchaseConfirmationDialogComponent,
    UnpublishButtonComponent,
    WithdrawButtonComponent
  ],
  entryComponents: [
    ProductCreatorDialogComponent,
    PurchaseConfirmationDialogComponent
  ]
})
export class ComponentsModule {
}
