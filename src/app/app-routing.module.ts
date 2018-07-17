import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketplaceSellComponent, MarketplaceSellLink } from './marketplace/marketplace-sell.component';
import { MarketplaceSellMyActiveListingsComponent } from './marketplace/marketplace-sell-my-active-listings.component';
import { MarketplaceSellPendingFinalisationComponent } from './marketplace/marketplace-sell-pending-finalisation.component';
import { MarketplaceBrowseComponent } from './marketplace/marketplace-browse.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MarketplaceSellUnpublishedComponent } from './marketplace/marketplace-sell-unpublished.component';
import { MarketplaceBuyComponent, MarketplaceBuyingLink } from './marketplace/marketplace-buy.component';
import { MarketplaceBuyReadyToDownloadComponent } from './marketplace/marketplace-buy-ready-to-download.component';
import { MarketplaceBuyAwaitingFinalisationComponent } from './marketplace/marketplace-buy-awaiting-finalisation.component';
import { SettingsIndexComponent } from './settings/settings-index/settings-index.component';
import { MarketplaceProductDetailsComponent } from './marketplace/marketplace-product-details.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'marketplace', component: MarketplaceBrowseComponent },
  { path: 'marketplace/details/:address', component: MarketplaceProductDetailsComponent },
  {
    path: 'sell', component: MarketplaceSellComponent, children: [
      { path: '', redirectTo: MarketplaceSellLink.MY_ACTIVE_LISTINGS, pathMatch: 'full' },
      { path: MarketplaceSellLink.MY_ACTIVE_LISTINGS, component: MarketplaceSellMyActiveListingsComponent, outlet: 'primary' },
      { path: MarketplaceSellLink.UNPUBLISHED, component: MarketplaceSellUnpublishedComponent },
      { path: MarketplaceSellLink.PENDING_FINALISATION, component: MarketplaceSellPendingFinalisationComponent }
    ]
  },
  { path: `sell/${MarketplaceSellLink.MY_ACTIVE_LISTINGS}/details/:address`, component: MarketplaceProductDetailsComponent },
  { path: `sell/${MarketplaceSellLink.UNPUBLISHED}/details/:address`, component: MarketplaceProductDetailsComponent },
  { path: `sell/${MarketplaceSellLink.PENDING_FINALISATION}/details/:address`, component: MarketplaceProductDetailsComponent },
  {
    path: 'buy', component: MarketplaceBuyComponent, children: [
      { path: '', redirectTo: 'ready-to-download', pathMatch: 'full' },
      { path: MarketplaceBuyingLink.READY_TO_DOWNLOAD, component: MarketplaceBuyReadyToDownloadComponent },
      { path: MarketplaceBuyingLink.AWAITING_FINALISATION, component: MarketplaceBuyAwaitingFinalisationComponent }
    ]
  },
  { path: `buy/${MarketplaceBuyingLink.READY_TO_DOWNLOAD}/details/:address`, component: MarketplaceProductDetailsComponent },
  { path: `buy/${MarketplaceBuyingLink.AWAITING_FINALISATION}/details/:address`, component: MarketplaceProductDetailsComponent },
  { path: 'settings', component: SettingsIndexComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
