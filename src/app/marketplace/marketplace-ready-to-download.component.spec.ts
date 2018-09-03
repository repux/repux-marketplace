import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';
import { Component, Input } from '@angular/core';
import { MarketplaceReadyToDownloadComponent } from './marketplace-ready-to-download.component';
import { MaterialModule } from '../material.module';
import { getReadyToDownloadDataProductsQuery } from './services/ready-to-download.service';
import { ActionButtonType } from '../shared/enums/action-button-type';
import BigNumber from 'bignumber.js';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() availableActions: ActionButtonType[];
  @Input() displayedColumns: string[];
  @Input() staticQuery;
  @Input() buyerAddress: string;
  @Input() defaultSort: Object;
}

describe('MarketplaceBuyReadyToDownloadComponent', () => {
  let component: MarketplaceReadyToDownloadComponent;
  let fixture: ComponentFixture<MarketplaceReadyToDownloadComponent>;
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
        MarketplaceReadyToDownloadComponent,
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

    fixture = TestBed.createComponent(MarketplaceReadyToDownloadComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#_onWalletChange()', () => {
    it('should set _wallet and staticQuery', () => {
      const wallet = new Wallet(buyerAddress, new BigNumber(1));

      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      expect(component.staticQuery).toEqual(getReadyToDownloadDataProductsQuery(buyerAddress));
      expect(component.defaultSort).toEqual({
        'orders.creationTimestamp': {
          order: 'desc',
          'nested_path': 'orders',
          'nested_filter': { match: { 'orders.buyerAddress': buyerAddress } }
        }
      });
    });
  });
});
