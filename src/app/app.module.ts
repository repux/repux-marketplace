import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LayoutModule } from '@angular/cdk/layout';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { NotificationsListItemComponent } from './notifications-list-item/notifications-list-item.component';
import { NotificationsListOrdersComponent } from './notifications-list-orders/notifications-list-orders.component';

@NgModule({
  declarations: [
    AppComponent,
    NotificationsListComponent,
    NotificationsListItemComponent,
    NotificationsListOrdersComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MaterialModule,
    SharedModule,
    SettingsModule,
    MarketplaceModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
