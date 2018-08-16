import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { MarketplaceBrowseComponent } from './marketplace-browse.component';
import { MarketplaceProductDetailsComponent } from './marketplace-product-details.component';
import { SharedModule } from '../shared/shared.module';
import { KeyStoreModule } from '../key-store/key-store.module';
import { MarketplaceSellComponent } from './marketplace-sell.component';
import { MarketplaceBuyComponent } from './marketplace-buy.component';
import { MarketplaceSellMyActiveListingsComponent } from './marketplace-sell-my-active-listings.component';
import { MarketplaceSellPendingFinalisationComponent } from './marketplace-sell-pending-finalisation.component';
import { MarketplaceSellUnpublishedComponent } from './marketplace-sell-unpublished.component';
import { MarketplaceBuyAwaitingFinalisationComponent } from './marketplace-buy-awaiting-finalisation.component';
import { MarketplaceBuyReadyToDownloadComponent } from './marketplace-buy-ready-to-download.component';
import { MarketplaceDataProductListComponent } from './marketplace-data-product-list/marketplace-data-product-list.component';
import { MarketplaceDataProductListDetailDirective } from './marketplace-data-product-list/marketplace-data-product-list-detail.directive';
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
  MarketplaceDataProductOrdersListComponent
} from './marketplace-data-product-orders-list/marketplace-data-product-orders-list.component';
import {
  MarketplaceDataProductOrdersListContainerComponent
} from './marketplace-data-product-orders-list-container/marketplace-data-product-orders-list-container.component';
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
    MarketplaceBuyComponent,
    MarketplaceBuyAwaitingFinalisationComponent,
    MarketplaceBuyReadyToDownloadComponent,
    MarketplaceProductDetailsComponent,

    MarketplaceEulaSelectorComponent,
    MarketplaceRateOrderDialogComponent,
    MarketplaceRateOrderButtonComponent,
    MarketplaceBuyProductButtonComponent,
    MarketplaceCancelPurchaseButtonComponent,
    MarketplaceDataProductListComponent,
    MarketplaceDataProductListDetailDirective,
    MarketplaceDataProductOrdersListComponent,
    MarketplaceDownloadProductButtonComponent,
    MarketplaceFinaliseButtonComponent,
    MarketplaceProductCategorySelectorComponent,
    MarketplaceProductCreatorDialogComponent,
    MarketplacePublishButtonComponent,
    MarketplacePurchaseConfirmationDialogComponent,
    MarketplaceUnpublishButtonComponent,
    MarketplaceWithdrawButtonComponent,
    MarketplaceActionButtonsComponent,
    MarketplaceDataProductOrdersListContainerComponent,
    MarketplaceRatingComponent,
    MarketplaceTaskManagerComponent,
    MarketplaceBeforeBuyConfirmationDialogComponent
  ],
  exports: [
    MarketplaceBrowseComponent,
    MarketplaceSellComponent,
    MarketplaceSellMyActiveListingsComponent,
    MarketplaceSellPendingFinalisationComponent,
    MarketplaceSellUnpublishedComponent,
    MarketplaceBuyComponent,
    MarketplaceBuyAwaitingFinalisationComponent,
    MarketplaceBuyReadyToDownloadComponent,
    MarketplaceActionButtonsComponent,
    MarketplaceProductDetailsComponent,
    MarketplaceTaskManagerComponent
  ],
  entryComponents: [
    MarketplaceProductCreatorDialogComponent,
    MarketplacePurchaseConfirmationDialogComponent,
    MarketplaceRateOrderDialogComponent,
    MarketplaceTaskManagerComponent,
    MarketplaceBeforeBuyConfirmationDialogComponent
  ]
})
export class MarketplaceModule {
}
