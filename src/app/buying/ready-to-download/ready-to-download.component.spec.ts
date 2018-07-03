import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { Component, Input } from '@angular/core';
import { ReadyToDownloadComponent } from './ready-to-download.component';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() availableActions: string[];
  @Input() staticQuery;
}

describe('ReadyToDownloadComponent', () => {
  let component: ReadyToDownloadComponent;
  let fixture: ComponentFixture<ReadyToDownloadComponent>;
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
        ReadyToDownloadComponent,
        DataProductListStubComponent
      ],
      imports: [
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: WalletService, useValue: walletServiceSpy },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReadyToDownloadComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#_onWalletChange()', () => {
    it('should set _wallet and staticQuery', () => {
      const staticQuery = 'STATIC_QUERY';
      component[ '_getStaticQuery' ] = jasmine.createSpy().and.returnValue(staticQuery);
      const wallet = new Wallet(buyerAddress, 1);

      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      expect(component.staticQuery).toBe(staticQuery);
    });
  });

  describe('#_getStaticQuery()', () => {
    it('should return valid query', () => {
      const wallet = new Wallet(buyerAddress, 1);

      expect(component[ '_getStaticQuery' ](wallet.address)).toEqual({
        bool: {
          must: [
            {
              nested: {
                path: 'transactions',
                query: {
                  bool: {
                    must: [
                      { match: { 'transactions.buyerAddress': wallet.address } },
                      { match: { 'transactions.finalised': true } }
                    ]
                  }
                }
              }
            }
          ]
        }
      });
    });
  });
});
