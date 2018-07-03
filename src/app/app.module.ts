import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataProductListComponent } from './data-product-list/data-product-list.component';
import { ProductCreatorDialogComponent } from './product-creator-dialog/product-creator-dialog.component';
import { ProductCategorySelectorComponent } from './product-category-selector/product-category-selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskManagerComponent } from './task-manager/task-manager.component';
import { TransactionDialogComponent } from './transaction-dialog/transaction-dialog.component';
import { PurchaseConfirmationDialogComponent } from './purchase-confirmation-dialog/purchase-confirmation-dialog.component';
import { BuyProductButtonComponent } from './buy-product-button/buy-product-button.component';
import { DownloadProductButtonComponent } from './download-product-button/download-product-button.component';
import { KeyStoreModule } from './key-store/key-store.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MetamaskDetectorComponent } from './shared/components/metamask-detector/metamask-detector.component';
import { SellComponent } from './sell/sell.component';
import { MyActiveListingsComponent } from './sell/my-active-listings/my-active-listings.component';
import { PendingFinalisationComponent } from './sell/pending-finalisation/pending-finalisation.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { WithdrawButtonComponent } from './withdraw-button/withdraw-button.component';
import { UnpublishButtonComponent } from './unpublish-button/unpublish-button.component';
import { UnpublishedComponent } from './sell/unpublished/unpublished.component';
import { DataProductListDetailDirective } from './data-product-list/data-product-list-detail.directive';
import { DataProductTransactionsListComponent } from './data-product-transactions-list/data-product-transactions-list.component';
import { FinaliseButtonComponent } from './finalise-button/finalise-button.component';
import { LayoutModule } from '@angular/cdk/layout';
import { PublishButtonComponent } from './publish-button/publish-button.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { BuyingComponent } from './buying/buying.component';
import { ReadyToDownloadComponent } from './buying/ready-to-download/ready-to-download.component';
import { AwaitingFinalisationComponent } from './buying/awaiting-finalisation/awaiting-finalisation.component';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { MaterialModule } from './material.module';
import { CancelPurchaseButtonComponent } from './cancel-purchase-button/cancel-purchase-button.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DataProductListComponent,
    DataProductListDetailDirective,
    DataProductTransactionsListComponent,
    ProductCreatorDialogComponent,
    ProductCategorySelectorComponent,
    TaskManagerComponent,
    TransactionDialogComponent,
    ConfirmationDialogComponent,
    PurchaseConfirmationDialogComponent,
    BuyProductButtonComponent,
    DownloadProductButtonComponent,
    MetamaskDetectorComponent,
    SellComponent,
    MyActiveListingsComponent,
    PendingFinalisationComponent,
    BuyingComponent,
    ReadyToDownloadComponent,
    AwaitingFinalisationComponent,
    UnpublishedComponent,
    MarketplaceComponent,
    WithdrawButtonComponent,
    PublishButtonComponent,
    UnpublishButtonComponent,
    FinaliseButtonComponent,
    CancelPurchaseButtonComponent,
    ProductDetailsComponent
  ],
  entryComponents: [
    ProductCreatorDialogComponent,
    TaskManagerComponent,
    TransactionDialogComponent,
    ConfirmationDialogComponent,
    PurchaseConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    KeyStoreModule,
    NotificationsModule,
    LayoutModule,
    MaterialModule,
    SharedModule,
    SettingsModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
