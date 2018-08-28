import { async, TestBed } from '@angular/core/testing';
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

@Component({ selector: 'app-notifications-list-item', template: '' })
class NotificationsListItemStub {
  @Input() actions: string[];
  @Input() product: DataProduct;
}

describe('AppComponent', () => {
  let matDialog;
  let unpublishedProductsServiceSpy;
  let pendingFinalisationServiceSpy;
  let awaitingFinalisationServiceSpy;
  let walletServiceSpy;

  beforeEach(async(() => {

    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'getProducts' ]);
    pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'getProducts' ]);
    awaitingFinalisationServiceSpy = jasmine.createSpyObj('AwaitingFinalisationService', [ 'getProducts' ]);
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);

    walletServiceSpy.getWallet.and.returnValue({
      subscribe(callback) {
        callback(new Wallet('', 0));
      }
    });

    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        NotificationsListComponent,
        NotificationsListItemStub
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
        { provide: AwaitingFinalisationService, useValue: awaitingFinalisationServiceSpy }
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should call open on _dialog property', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.openProductCreatorDialog();
    expect(matDialog.open.calls.count()).toBe(1);
    expect(matDialog.open.calls.allArgs()[ 0 ][ 0 ]).toEqual(MarketplaceProductCreatorDialogComponent);
  });

  it('should return total for unpublished, pending finalisation and awaiting finalisation products', done => {
    unpublishedProductsServiceSpy.getProducts.and.returnValue(of([new DataProduct(), new DataProduct()]));
    pendingFinalisationServiceSpy.getProducts.and.returnValue(of([new DataProduct()]));
    awaitingFinalisationServiceSpy.getProducts.and.returnValue(of([new DataProduct()]));

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    app.countProducts().subscribe(result => {
      expect(result).toBe(4);
      done();
    });

  });
});
