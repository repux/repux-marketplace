import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { MarketplaceBrowseComponent } from './marketplace-browse.component';
import { MarketplaceProductDetailsComponent } from './marketplace-product-details.component';
import { SharedModule } from '../shared/shared.module';
import { KeyStoreModule } from '../key-store/key-store.module';
import { MarketplaceSellComponent } from './marketplace-sell.component';
import { MarketplaceBuyingComponent } from './marketplace-buying.component';
import { MarketplaceSellMyActiveListingsComponent } from './marketplace-sell-my-active-listings.component';
import { MarketplaceSellPendingFinalisationComponent } from './marketplace-sell-pending-finalisation.component';
import { MarketplaceSellUnpublishedComponent } from './marketplace-sell-unpublished.component';
import { MarketplaceBuyingAwaitingFinalisationComponent } from './marketplace-buying-awaiting-finalisation.component';
import { MarketplaceBuyingReadyToDownloadComponent } from './marketplace-buying-ready-to-download.component';
import { MarketplaceDataProductListComponent } from './marketplace-data-product-list/marketplace-data-product-list.component';
import { MarketplaceDataProductListDetailDirective } from './marketplace-data-product-list/marketplace-data-product-list-detail.directive';
import { AppRoutingModule } from '../app-routing.module';
import { MarketplaceBuyProductButtonComponent } from './marketplace-buy-product-button/marketplace-buy-product-button.component';
import { MarketplaceFinaliseButtonComponent } from './marketplace-finalise-button/marketplace-finalise-button.component';
import { MarketplacePublishButtonComponent } from './marketplace-publish-button/marketplace-publish-button.component';
import { MarketplaceUnpublishButtonComponent } from './marketplace-unpublish-button/marketplace-unpublish-button.component';
import { MarketplaceWithdrawButtonComponent } from './marketplace-withdraw-button/marketplace-withdraw-button.component';
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
  MarketplaceDataProductTransactionsListComponent
} from './marketplace-data-product-transactions-list/marketplace-data-product-transactions-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    MarketplaceSellComponent,
    MarketplaceSellMyActiveListingsComponent,
    MarketplaceSellPendingFinalisationComponent,
    MarketplaceSellUnpublishedComponent,
    MarketplaceBuyingComponent,
    MarketplaceBuyingAwaitingFinalisationComponent,
    MarketplaceBuyingReadyToDownloadComponent,
    MarketplaceProductDetailsComponent,

    MarketplaceBuyProductButtonComponent,
    MarketplaceCancelPurchaseButtonComponent,
    MarketplaceDataProductListComponent,
    MarketplaceDataProductListDetailDirective,
    MarketplaceDataProductTransactionsListComponent,
    MarketplaceDownloadProductButtonComponent,
    MarketplaceFinaliseButtonComponent,
    MarketplaceProductCategorySelectorComponent,
    MarketplaceProductCreatorDialogComponent,
    MarketplacePublishButtonComponent,
    MarketplacePurchaseConfirmationDialogComponent,
    MarketplaceUnpublishButtonComponent,
    MarketplaceWithdrawButtonComponent
  ],
  exports: [
    MarketplaceBrowseComponent,
    MarketplaceSellComponent,
    MarketplaceSellMyActiveListingsComponent,
    MarketplaceSellPendingFinalisationComponent,
    MarketplaceSellUnpublishedComponent,
    MarketplaceBuyingComponent,
    MarketplaceBuyingAwaitingFinalisationComponent,
    MarketplaceBuyingReadyToDownloadComponent,
    MarketplaceProductDetailsComponent
  ],
  entryComponents: [
    MarketplaceProductCreatorDialogComponent,
    MarketplacePurchaseConfirmationDialogComponent
  ]
})
export class MarketplaceModule {
}
