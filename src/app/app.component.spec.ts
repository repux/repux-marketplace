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

describe('AppComponent', () => {
  let matDialog;
  beforeEach(async(() => {

    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        AppComponent
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
        { provide: WalletService, useValue: jasmine.createSpy() },
        { provide: HttpClient, useValue: jasmine.createSpy() }
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  describe('#openProductCreatorDialog()', () => {
    it('should call open on _dialog property', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      app.openProductCreatorDialog();
      expect(matDialog.open.calls.count()).toBe(1);
      expect(matDialog.open.calls.allArgs()[ 0 ][ 0 ]).toEqual(MarketplaceProductCreatorDialogComponent);
    });
  });
});
