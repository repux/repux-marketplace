import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';
import { Component, Input } from '@angular/core';
import { MarketplaceBuyReadyToDownloadComponent } from './marketplace-buy-ready-to-download.component';
import { MaterialModule } from '../material.module';
import { getReadyToDownloadDataProductsQuery } from './services/ready-to-download.service';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() availableActions: string[];
  @Input() displayedColumns: string[];
  @Input() staticQuery;
  @Input() buyerAddress: string;
}

describe('MarketplaceBuyReadyToDownloadComponent', () => {
  let component: MarketplaceBuyReadyToDownloadComponent;
  let fixture: ComponentFixture<MarketplaceBuyReadyToDownloadComponent>;
  let walletServiceSpy;
  const buyerAddress = '0x00';

  beforeEach(fakeAsync(() => {
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue({
      subscribe() {
      }
    });
    TestBed.configureTestingModule({
      declarations: [
        MarketplaceBuyReadyToDownloadComponent,
        DataProductListStubComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: WalletService, useValue: walletServiceSpy },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceBuyReadyToDownloadComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#_onWalletChange()', () => {
    it('should set _wallet and staticQuery', () => {
      const wallet = new Wallet(buyerAddress, 1);

      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      expect(component.staticQuery).toEqual(getReadyToDownloadDataProductsQuery(buyerAddress));
    });
  });
});
