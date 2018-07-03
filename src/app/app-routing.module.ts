import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketplaceSellComponent } from './marketplace/marketplace-sell.component';
import { MarketplaceSellMyActiveListingsComponent } from './marketplace/marketplace-sell-my-active-listings.component';
import { MarketplaceSellPendingFinalisationComponent } from './marketplace/marketplace-sell-pending-finalisation.component';
import { MarketplaceBrowseComponent } from './marketplace/marketplace-browse.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MarketplaceSellUnpublishedComponent } from './marketplace/marketplace-sell-unpublished.component';
import { MarketplaceBuyingComponent } from './marketplace/marketplace-buying.component';
import { MarketplaceBuyingReadyToDownloadComponent } from './marketplace/marketplace-buying-ready-to-download.component';
import { MarketplaceBuyingAwaitingFinalisationComponent } from './marketplace/marketplace-buying-awaiting-finalisation.component';
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
      { path: 'my-active-listings', component: MarketplaceSellMyActiveListingsComponent },
      { path: 'marketplace-sell-unpublished', component: MarketplaceSellUnpublishedComponent },
      { path: 'pending-finalisation', component: MarketplaceSellPendingFinalisationComponent }
    ]
  },
  {
    path: 'buying', component: MarketplaceBuyingComponent, children: [
      { path: '', redirectTo: 'ready-to-download', pathMatch: 'full' },
      { path: 'ready-to-download', component: MarketplaceBuyingReadyToDownloadComponent },
      { path: 'awaiting-finalisation', component: MarketplaceBuyingAwaitingFinalisationComponent }
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
