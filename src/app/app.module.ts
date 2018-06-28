import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PipesModule } from './pipes/pipes.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataProductListComponent } from './data-product-list/data-product-list.component';
import { ProductCreatorDialogComponent } from './product-creator-dialog/product-creator-dialog.component';
import { ProductCategorySelectorComponent } from './product-category-selector/product-category-selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileInputComponent } from './file-input/file-input.component';
import { TaskManagerComponent } from './task-manager/task-manager.component';
import { TransactionDialogComponent } from './transaction-dialog/transaction-dialog.component';
import {
  MatTableModule,
  MatInputModule,
  MatPaginatorModule,
  MatIconModule,
  MatSortModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatDialogModule,
  MatSelectModule,
  MatToolbarModule,
  MatGridListModule,
  MatCardModule,
  MatMenuModule,
  MatTabsModule,
  MatTooltipModule,
  MatChipsModule,
  MatSidenavModule,
  MatListModule
} from '@angular/material';
import { PurchaseConfirmationDialogComponent } from './purchase-confirmation-dialog/purchase-confirmation-dialog.component';
import { BuyProductButtonComponent } from './buy-product-button/buy-product-button.component';
import { DownloadProductButtonComponent } from './download-product-button/download-product-button.component';
import { KeyStoreModule } from './key-store/key-store.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MetamaskDetectorComponent } from './metamask-detector/metamask-detector.component';
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

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DataProductListComponent,
    DataProductListDetailDirective,
    DataProductTransactionsListComponent,
    ProductCreatorDialogComponent,
    ProductCategorySelectorComponent,
    FileInputComponent,
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
    UnpublishedComponent,
    MarketplaceComponent,
    WithdrawButtonComponent,
    PublishButtonComponent,
    UnpublishButtonComponent,
    FinaliseButtonComponent
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
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTabsModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule,
    KeyStoreModule,
    NotificationsModule,
    LayoutModule,
    MatSidenavModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
