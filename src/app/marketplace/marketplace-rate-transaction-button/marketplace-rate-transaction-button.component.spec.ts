import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceRateTransactionButtonComponent } from './marketplace-rate-transaction-button.component';
import BigNumber from 'bignumber.js';
import { MaterialModule } from '../../material.module';
import {
  MarketplaceRateTransactionDialogComponent
} from '../marketplace-rate-transaction-dialog/marketplace-rate-transaction-dialog.component';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { from } from 'rxjs/internal/observable/from';
import { DataProductService } from '../../services/data-product.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

describe('MarketplaceRateTransactionButton', () => {
  let component: MarketplaceRateTransactionButtonComponent;
  let fixture: ComponentFixture<MarketplaceRateTransactionButtonComponent>;
  let commonDialogServiceSpy;
  let dataProductServiceSpy;

  const second = 1000;
  const currentDate = Date.now();

  beforeEach(async () => {
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'rateDataProductPurchase' ]);
    commonDialogServiceSpy = jasmine.createSpyObj('CommonDialogService', [ 'transaction' ]);

    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceRateTransactionButtonComponent,
        MarketplaceRateTransactionDialogComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CommonDialogService, useValue: commonDialogServiceSpy },
        { provide: DataProductService, useValue: dataProductServiceSpy }
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          MarketplaceRateTransactionDialogComponent
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceRateTransactionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#get rating()', () => {
    it('should return rating value from blockchainBuyTransaction', () => {
      component.blockchainBuyTransaction = <any> { rating: new BigNumber(1) };
      expect(component.rating).toEqual(new BigNumber(1));

      component.blockchainBuyTransaction = null;
      expect(component.rating).toEqual(null);
    });
  });

  describe('#get canRate()', () => {
    it('should return true when user can rate purchase transaction', () => {
      component[ 'date' ] = new Date(currentDate);
      component.blockchainBuyTransaction = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };
      expect(component.canRate).toBe(true);

      component.blockchainBuyTransaction = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate - second),
        finalised: true
      };
      expect(component.canRate).toBe(false);

      component.blockchainBuyTransaction = <any> {
        rating: new BigNumber(1),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };
      expect(component.canRate).toBe(false);

      component.blockchainBuyTransaction = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: false
      };
      expect(component.canRate).toBe(false);

      component.blockchainBuyTransaction = null;
      expect(component.canRate).toBe(false);
    });
  });

  describe('#ngOnDestroy()', () => {
    it('should call unsubscribeDialogSubscription', () => {
      const unsubscribeDialogSubscription = jasmine.createSpy();
      component.unsubscribeDialogSubscription = unsubscribeDialogSubscription;

      component.ngOnDestroy();

      expect(unsubscribeDialogSubscription.calls.count()).toBe(1);
    });
  });

  describe('#onDialogSubscriptionClose()', () => {
    it('should call unsubscribeDialogSubscription', async () => {
      const unsubscribeDialogSubscription = jasmine.createSpy();
      component.unsubscribeDialogSubscription = unsubscribeDialogSubscription;

      await component.onDialogSubscriptionClose(new BigNumber(1));

      expect(unsubscribeDialogSubscription.calls.count()).toBe(1);
    });

    it('should call saveRating when result is present', async () => {
      const saveRating = jasmine.createSpy();
      component.saveRating = saveRating;

      await component.onDialogSubscriptionClose(new BigNumber(1));
      await component.onDialogSubscriptionClose(null);

      expect(saveRating.calls.count()).toBe(1);
    });
  });

  describe('#rateTransaction()', () => {
    it('should call unsubscribeDialogSubscription', () => {
      component[ 'date' ] = new Date(currentDate);
      component.blockchainBuyTransaction = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };

      const unsubscribeDialogSubscription = jasmine.createSpy();
      component.unsubscribeDialogSubscription = unsubscribeDialogSubscription;

      component.rateTransaction();

      expect(unsubscribeDialogSubscription.calls.count()).toBe(1);
    });

    it('should assign dialog afterClose subscription to dialogSubscription', () => {
      component[ 'date' ] = new Date(currentDate);
      component.blockchainBuyTransaction = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };

      expect(component[ 'dialogSubscription' ]).toBeUndefined();

      component.rateTransaction();

      expect(component[ 'dialogSubscription' ]).not.toBeUndefined();
    });
  });

  describe('#saveRating()', () => {
    it('should save rating to blockchain using commonDialogService.transaction() method', async () => {
      const rate = new BigNumber(1);
      const address = '0x00';

      component[ 'date' ] = new Date(currentDate);
      component.blockchainBuyTransaction = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };
      component.dataProduct = <any> {
        address
      };

      commonDialogServiceSpy.transaction.and.callFake(methodToCall => {
        methodToCall();

        return {
          afterClosed() {
            return from(Promise.resolve(true));
          }
        };
      });

      await component.saveRating(rate);

      expect(component.blockchainBuyTransaction.rating).toEqual(new BigNumber(1));
      expect(dataProductServiceSpy.rateDataProductPurchase.calls.count()).toBe(1);
      expect(dataProductServiceSpy.rateDataProductPurchase.calls.allArgs()[ 0 ]).toEqual([ address, rate ]);
      expect(commonDialogServiceSpy.transaction.calls.count()).toBe(1);
    });
  });
});
