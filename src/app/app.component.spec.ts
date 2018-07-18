import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { APP_BASE_HREF } from '@angular/common';
import { WalletService } from './services/wallet.service';
import { HttpClient } from '@angular/common/http';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';
import { MaterialModule } from './material.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        DashboardComponent
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
});
