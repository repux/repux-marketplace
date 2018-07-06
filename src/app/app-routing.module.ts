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
  { path: 'marketplace/:address', component: MarketplaceProductDetailsComponent },
  {
    path: 'sell', component: MarketplaceSellComponent, children: [
      { path: '', redirectTo: 'my-active-listings', pathMatch: 'full' },
      { path: MarketplaceSellLink.MY_ACTIVE_LISTINGS, component: MarketplaceSellMyActiveListingsComponent },
      { path: MarketplaceSellLink.UNPUBLISHED, component: MarketplaceSellUnpublishedComponent },
      { path: MarketplaceSellLink.PENDING_FINALISATION, component: MarketplaceSellPendingFinalisationComponent }
    ]
  },
  {
    path: 'buy', component: MarketplaceBuyComponent, children: [
      { path: '', redirectTo: 'ready-to-download', pathMatch: 'full' },
      { path: MarketplaceBuyingLink.READY_TO_DOWNLOAD, component: MarketplaceBuyReadyToDownloadComponent },
      { path: MarketplaceBuyingLink.AWAITING_FINALISATION, component: MarketplaceBuyAwaitingFinalisationComponent }
    ]
  },
  { path: 'settings', component: SettingsIndexComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
