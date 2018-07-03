import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataProductListComponent } from './data-product-list/data-product-list.component';
import { APP_BASE_HREF } from '@angular/common';
import { MetamaskDetectorComponent } from './shared/components/metamask-detector/metamask-detector.component';
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
import { SharedModule } from './shared/shared.module';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { MaterialModule } from './material.module';

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
        FinaliseButtonComponent,
        ProductDetailsComponent
      ],
      imports: [
        AppRoutingModule,
        NoopAnimationsModule,
        MaterialModule,
        SharedModule,
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
