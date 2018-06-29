import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellComponent } from './sell/sell.component';
import { MyActiveListingsComponent } from './sell/my-active-listings/my-active-listings.component';
import { PendingFinalisationComponent } from './sell/pending-finalisation/pending-finalisation.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UnpublishedComponent } from './sell/unpublished/unpublished.component';
import { BuyingComponent } from './buying/buying.component';
import { ReadyToDownloadComponent } from './buying/ready-to-download/ready-to-download.component';
import { AwaitingFinalisationComponent } from './buying/awaiting-finalisation/awaiting-finalisation.component';
import { SettingsIndexComponent } from './settings/settings-index/settings-index.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  {
    path: 'sell', component: SellComponent, children: [
      { path: '', redirectTo: 'my-active-listings', pathMatch: 'full' },
      { path: 'my-active-listings', component: MyActiveListingsComponent },
      { path: 'unpublished', component: UnpublishedComponent },
      { path: 'pending-finalisation', component: PendingFinalisationComponent }
    ]
  },
  {
    path: 'buying', component: BuyingComponent, children: [
      { path: '', redirectTo: 'ready-to-download', pathMatch: 'full' },
      { path: 'ready-to-download', component: ReadyToDownloadComponent },
      { path: 'awaiting-finalisation', component: AwaitingFinalisationComponent }
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
