import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { MarketplaceBrowseComponent } from './marketplace-browse.component';
import { MarketplaceProductDetailsComponent } from './marketplace-product-details.component';
import { SharedModule } from '../shared/shared.module';
import { KeyStoreModule } from '../key-store/key-store.module';
import { MarketplaceActiveListingsComponent } from './marketplace-active-listings.component';
import { MarketplaceReadyToDownloadComponent } from './marketplace-ready-to-download.component';
import { MarketplaceDataProductListComponent } from './marketplace-data-product-list/marketplace-data-product-list.component';
import { AppRoutingModule } from '../app-routing.module';
import { MarketplaceBuyProductButtonComponent } from './marketplace-buy-product-button/marketplace-buy-product-button.component';
import { MarketplaceFinaliseButtonComponent } from './marketplace-finalise-button/marketplace-finalise-button.component';
import { MarketplacePublishButtonComponent } from './marketplace-publish-button/marketplace-publish-button.component';
import { MarketplaceUnpublishButtonComponent } from './marketplace-unpublish-button/marketplace-unpublish-button.component';
import { MarketplaceWithdrawButtonComponent } from './marketplace-withdraw-button/marketplace-withdraw-button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarketplaceEulaSelectorComponent } from './marketplace-eula-selector/marketplace-eula-selector.component';
import { MarketplaceActionButtonsComponent } from './marketplace-action-buttons/marketplace-action-buttons.component';
import {
  MarketplaceProductCategorySelectorComponent
} from './marketplace-product-category-selector/marketplace-product-category-selector.component';
import {
  MarketplaceProductCreatorDialogComponent
} from './marketplace-product-creator-dialog/marketplace-product-creator-dialog.component';
import {
  MarketplacePurchaseConfirmationDialogComponent
} from './marketplace-purchase-confirmation-dialog/marketplace-purchase-confirmation-dialog.component';
import {
  MarketplaceCancelPurchaseButtonComponent
} from './marketplace-cancel-purchase-button/marketplace-cancel-purchase-button.component';
import {
  MarketplaceDownloadProductButtonComponent
} from './marketplace-download-product-button/marketplace-download-product-button.component';
import {
  MarketplaceRateOrderDialogComponent
} from './marketplace-rate-order-dialog/marketplace-rate-order-dialog.component';
import {
  MarketplaceRateOrderButtonComponent
} from './marketplace-rate-order-button/marketplace-rate-order-button.component';
import { MarketplaceRatingComponent } from './marketplace-rating/marketplace-rating.component';
import { MarketplaceTaskManagerComponent } from './marketplace-task-manager/marketplace-task-manager.component';
import {
  MarketplaceBeforeBuyConfirmationDialogComponent
} from './marketplace-before-buy-confirmation-dialog/marketplace-before-buy-confirmation-dialog.component';
import { MarketplaceMyFilesComponent } from './marketplace-my-files.component';
import { MarketplaceListFilterComponent } from './marketplace-list-filter/marketplace-list-filter.component';
import { MarketplaceAnalyticsDialogComponent } from './marketplace-analytics-dialog/marketplace-analytics-dialog.component';
import { MarketplaceProductCreatorAnalyticsDialogComponent } from './marketplace-product-creator-analytics-dialog/marketplace-product-creator-analytics-dialog.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    MaterialModule,
    SharedModule,
    KeyStoreModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    MarketplaceBrowseComponent,
    MarketplaceActiveListingsComponent,
    MarketplaceReadyToDownloadComponent,
    MarketplaceProductDetailsComponent,
    MarketplaceEulaSelectorComponent,
    MarketplaceRateOrderDialogComponent,
    MarketplaceRateOrderButtonComponent,
    MarketplaceBuyProductButtonComponent,
    MarketplaceCancelPurchaseButtonComponent,
    MarketplaceDataProductListComponent,
    MarketplaceDownloadProductButtonComponent,
    MarketplaceFinaliseButtonComponent,
    MarketplaceProductCategorySelectorComponent,
    MarketplaceProductCreatorDialogComponent,
    MarketplacePublishButtonComponent,
    MarketplacePurchaseConfirmationDialogComponent,
    MarketplaceUnpublishButtonComponent,
    MarketplaceWithdrawButtonComponent,
    MarketplaceActionButtonsComponent,
    MarketplaceRatingComponent,
    MarketplaceTaskManagerComponent,
    MarketplaceBeforeBuyConfirmationDialogComponent,
    MarketplaceMyFilesComponent,
    MarketplaceListFilterComponent,
    MarketplaceAnalyticsDialogComponent,
    MarketplaceProductCreatorAnalyticsDialogComponent
  ],
  exports: [
    MarketplaceBrowseComponent,
    MarketplaceActiveListingsComponent,
    MarketplaceReadyToDownloadComponent,
    MarketplaceActionButtonsComponent,
    MarketplaceFinaliseButtonComponent,
    MarketplaceProductDetailsComponent,
    MarketplaceTaskManagerComponent,
    MarketplaceListFilterComponent,
    MarketplaceAnalyticsDialogComponent,
    MarketplaceProductCreatorAnalyticsDialogComponent
  ],
  entryComponents: [
    MarketplaceProductCreatorDialogComponent,
    MarketplacePurchaseConfirmationDialogComponent,
    MarketplaceRateOrderDialogComponent,
    MarketplaceTaskManagerComponent,
    MarketplaceBeforeBuyConfirmationDialogComponent,
    MarketplaceAnalyticsDialogComponent,
    MarketplaceProductCreatorAnalyticsDialogComponent
  ]
})
export class MarketplaceModule {
}
