import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { APP_BASE_HREF } from '@angular/common';
import { WalletService } from './services/wallet.service';
import { HttpClient } from '@angular/common/http';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// tslint:disable-next-line:max-line-length
import { MarketplaceProductCreatorDialogComponent } from './marketplace/marketplace-product-creator-dialog/marketplace-product-creator-dialog.component';
import { MatDialog } from '@angular/material';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { PendingFinalisationService } from './marketplace/services/pending-finalisation.service';
import { UnpublishedProductsService } from './marketplace/services/unpublished-products.service';
import { Component, Input } from '@angular/core';
import { DataProduct } from './shared/models/data-product';
import Wallet from './shared/models/wallet';
import { AwaitingFinalisationService } from './marketplace/services/awaiting-finalisation.service';
import { of } from 'rxjs';
import { WebpushNotificationService } from './services/webpush-notification.service';
import BigNumber from 'bignumber.js';
import { MarketplaceAnalyticsDialogComponent } from './marketplace/marketplace-analytics-dialog/marketplace-analytics-dialog.component';
import { ActivatedRoute } from '@angular/router';
import {
  MarketplaceProductCreatorAnalyticsDialogComponent
} from './marketplace/marketplace-product-creator-analytics-dialog/marketplace-product-creator-analytics-dialog.component';

@Component({ selector: 'app-notifications-list-item', template: '' })
class NotificationsListItemStubComponent {
  @Input() actions: string[];
  @Input() product: DataProduct;
  @Input() showOrders: boolean;
  @Input() showMyOrderData: boolean;
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  let matDialog;
  let unpublishedProductsServiceSpy;
  let pendingFinalisationServiceSpy;
  let awaitingFinalisationServiceSpy;
  let webpushNotificationServiceSpy;
  let walletServiceSpy;
  let activatedRouteSpy;
  const fragment = 'state=0&access_token=TOKEN';

  beforeEach(async () => {

    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    matDialog.open.and.returnValue({
      componentInstance: {}
    });
    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'getProducts' ]);
    pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'getProducts' ]);
    awaitingFinalisationServiceSpy = jasmine.createSpyObj('AwaitingFinalisationService', [ 'getProducts' ]);
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    webpushNotificationServiceSpy = jasmine.createSpyObj('WebpushNotificationService', [ 'getNotificationPermission' ]);
    activatedRouteSpy = {
      fragment: of(fragment)
    };

    walletServiceSpy.getWallet.and.returnValue({
      subscribe(callback) {
        callback(new Wallet('', new BigNumber(0), new BigNumber(1)));
      }
    });

    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        NotificationsListComponent,
        NotificationsListItemStubComponent
      ],
      imports: [
        AppRoutingModule,
        NoopAnimationsModule,
        MaterialModule,
        SharedModule,
        SettingsModule,
        MarketplaceModule
      ],
      providers: [
        { provide: MatDialog, useValue: matDialog },
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: HttpClient, useValue: jasmine.createSpy() },
        { provide: PendingFinalisationService, useValue: pendingFinalisationServiceSpy },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsServiceSpy },
        { provide: AwaitingFinalisationService, useValue: awaitingFinalisationServiceSpy },
        { provide: WebpushNotificationService, useValue: webpushNotificationServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();


    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
  });

  it('should create the app', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should call open on _dialog property', () => {
    component.openProductCreatorDialog();
    expect(matDialog.open.calls.count()).toBe(1);
    expect(matDialog.open.calls.allArgs()[ 0 ][ 0 ]).toEqual(MarketplaceProductCreatorDialogComponent);
  });

  it('should call open on _dialog property', () => {
    component.openAnalyticsIntegrationDialog();
    expect(matDialog.open.calls.count()).toBe(1);
    expect(matDialog.open.calls.allArgs()[ 0 ][ 0 ]).toEqual(MarketplaceAnalyticsDialogComponent);
  });

  it('should return total for unpublished, pending finalisation and awaiting finalisation products', done => {
    unpublishedProductsServiceSpy.getProducts.and.returnValue(of([ new DataProduct(), new DataProduct() ]));
    pendingFinalisationServiceSpy.getProducts.and.returnValue(of([ new DataProduct() ]));
    awaitingFinalisationServiceSpy.getProducts.and.returnValue(of([ new DataProduct() ]));

    component.countProducts().subscribe(result => {
      expect(result).toBe(4);
      done();
    });
  });

  it('should call resolveOauthUrl when route fragment includes "access_token" string', () => {
    (<any> window).Intercom = () => {
    };
    const resolveOauthUrl = jasmine.createSpy();
    component.resolveOauthUrl = resolveOauthUrl;

    component.ngOnInit();
    expect(resolveOauthUrl.calls.count()).toBe(1);
    expect(resolveOauthUrl.calls.allArgs()[ 0 ]).toEqual([ new URLSearchParams(fragment) ]);
  });

  describe('#resolveOauthUrl()', () => {
    it('should open MarketplaceProductCreatorAnalyticsDialogComponent when state == OAuthState.AnalyticsIntegration', () => {
      component.resolveOauthUrl(new URLSearchParams(fragment));

      expect(matDialog.open.calls.count()).toBe(1);
      expect(matDialog.open.calls.allArgs()[ 0 ][ 0 ]).toEqual(MarketplaceProductCreatorAnalyticsDialogComponent);
    });
  });
});
