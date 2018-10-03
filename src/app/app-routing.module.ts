import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketplaceActiveListingsComponent } from './marketplace/marketplace-active-listings.component';
import { MarketplaceBrowseComponent } from './marketplace/marketplace-browse.component';
import { MarketplaceReadyToDownloadComponent } from './marketplace/marketplace-ready-to-download.component';
import { SettingsIndexComponent } from './settings/settings-index/settings-index.component';
import { MarketplaceProductDetailsComponent } from './marketplace/marketplace-product-details.component';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { MarketplaceMyFilesComponent } from './marketplace/marketplace-my-files.component';

const routes: Routes = [
  { path: '', redirectTo: '/marketplace', pathMatch: 'full' },
  { path: 'marketplace', component: MarketplaceBrowseComponent },
  { path: 'marketplace/details/:address', component: MarketplaceProductDetailsComponent },
  {
    path: 'my-files', component: MarketplaceMyFilesComponent, children: [
      { path: '', redirectTo: 'active-listings', pathMatch: 'full' },
      {
        path: 'active-listings',
        component: MarketplaceActiveListingsComponent,
        outlet: 'primary'
      },
      {
        path: 'files-to-download',
        component: MarketplaceReadyToDownloadComponent,
        outlet: 'primary'
      }
    ]
  },
  { path: `my-files/active-listings/details/:address`, component: MarketplaceProductDetailsComponent },
  { path: `my-files/files-to-download/details/:address`, component: MarketplaceProductDetailsComponent },
  { path: 'notifications', component: NotificationsListComponent },
  { path: 'settings', component: SettingsIndexComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
