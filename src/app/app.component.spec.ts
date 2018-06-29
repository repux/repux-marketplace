import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataProductListComponent } from './data-product-list/data-product-list.component';
import {
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatGridListModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
} from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PipesModule } from './pipes/pipes.module';
import { APP_BASE_HREF } from '@angular/common';
import { MetamaskDetectorComponent } from './metamask-detector/metamask-detector.component';
import { DataProductNotificationsService } from './services/data-product-notifications.service';
import { BuyProductButtonComponent } from './buy-product-button/buy-product-button.component';
import { DownloadProductButtonComponent } from './download-product-button/download-product-button.component';
import { WalletService } from './services/wallet.service';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { SellComponent } from './sell/sell.component';
import { MyActiveListingsComponent } from './sell/my-active-listings/my-active-listings.component';
import { PendingFinalisationComponent } from './sell/pending-finalisation/pending-finalisation.component';
import { WithdrawButtonComponent } from './withdraw-button/withdraw-button.component';
import { UnpublishButtonComponent } from './unpublish-button/unpublish-button.component';
import { UnpublishedComponent } from './sell/unpublished/unpublished.component';
import { DataProductListDetailDirective } from './data-product-list/data-product-list-detail.directive';
import { DataProductTransactionsListComponent } from './data-product-transactions-list/data-product-transactions-list.component';
import { FinaliseButtonComponent } from './finalise-button/finalise-button.component';
import { PublishButtonComponent } from './publish-button/publish-button.component';
import { HttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BuyingComponent } from './buying/buying.component';
import { ReadyToDownloadComponent } from './buying/ready-to-download/ready-to-download.component';
import { AwaitingFinalisationComponent } from './buying/awaiting-finalisation/awaiting-finalisation.component';
import { SettingsModule } from './settings/settings.module';

describe('AppComponent', () => {
  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        DashboardComponent,
        MarketplaceComponent,
        SellComponent,
        MyActiveListingsComponent,
        PendingFinalisationComponent,
        BuyingComponent,
        ReadyToDownloadComponent,
        AwaitingFinalisationComponent,
        UnpublishedComponent,
        DataProductListComponent,
        DataProductListDetailDirective,
        DataProductTransactionsListComponent,
        MetamaskDetectorComponent,
        BuyProductButtonComponent,
        DownloadProductButtonComponent,
        WithdrawButtonComponent,
        PublishButtonComponent,
        UnpublishButtonComponent,
        FinaliseButtonComponent
      ],
      imports: [
        AppRoutingModule,
        MatToolbarModule,
        MatCardModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule,
        MatTabsModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatTableModule,
        MatChipsModule,
        MatSortModule,
        MatSidenavModule,
        MatListModule,
        PipesModule,
        NoopAnimationsModule,
        SettingsModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: WalletService, useValue: jasmine.createSpy() },
        { provide: DataProductNotificationsService, useValue: jasmine.createSpy() },
        { provide: HttpClient, useValue: jasmine.createSpy() }
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
