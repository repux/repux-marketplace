import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceRateOrderButtonComponent } from './marketplace-rate-order-button.component';
import BigNumber from 'bignumber.js';
import { MaterialModule } from '../../material.module';
import {
  MarketplaceRateOrderDialogComponent
} from '../marketplace-rate-order-dialog/marketplace-rate-order-dialog.component';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { DataProductService } from '../../services/data-product.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { EthTransactionLinkComponent } from '../../shared/components/eth-transaction-link/eth-transaction-link.component';

describe('MarketplaceRateOrderButton', () => {
  let component: MarketplaceRateOrderButtonComponent;
  let fixture: ComponentFixture<MarketplaceRateOrderButtonComponent>;
  let commonDialogServiceSpy;
  let dataProductServiceSpy;
  let transactionServiceSpy;

  const second = 1000;
  const currentDate = Date.now();
  const dataProductAddress = '0x00';

  beforeEach(async () => {
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'rateDataProductPurchase' ]);

    commonDialogServiceSpy = jasmine.createSpyObj('CommonDialogService', [ 'transaction' ]);
    commonDialogServiceSpy.transaction.and.callFake(methodToCall => methodToCall());

    transactionServiceSpy = jasmine.createSpyObj('TransactionService', [ 'getTransactionReceipt', 'getTransactions' ]);
    transactionServiceSpy.getTransactionReceipt.and.returnValue(Promise.resolve({ status: TransactionStatus.SUCCESSFUL }));
    transactionServiceSpy.getTransactions.and.returnValue({
      subscribe() {
      }
    });

    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceRateOrderButtonComponent,
        MarketplaceRateOrderDialogComponent,
        EthTransactionLinkComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CommonDialogService, useValue: commonDialogServiceSpy },
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy }
      ]
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          MarketplaceRateOrderDialogComponent
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceRateOrderButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.dataProduct = <any> {
      address: dataProductAddress
    };
  });

  describe('#get rating()', () => {
    it('should return rating value from blockchainDataProductOrder', () => {
      component.blockchainDataProductOrder = <any> { rating: new BigNumber(1) };
      expect(component.rating).toEqual(new BigNumber(1));

      component.blockchainDataProductOrder = null;
      expect(component.rating).toEqual(null);
    });
  });

  describe('#get canRate()', () => {
    it('should return true when user can rate purchase order', () => {
      component[ 'date' ] = new Date(currentDate);
      component.blockchainDataProductOrder = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };
      expect(component.canRate).toBe(true);

      component.blockchainDataProductOrder = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate - second),
        finalised: true
      };
      expect(component.canRate).toBe(false);

      component.blockchainDataProductOrder = <any> {
        rating: new BigNumber(1),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };
      expect(component.canRate).toBe(false);

      component.blockchainDataProductOrder = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: false
      };
      expect(component.canRate).toBe(false);

      component.blockchainDataProductOrder = null;
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

  describe('#rateOrder()', () => {
    it('should call unsubscribeDialogSubscription', () => {
      component[ 'date' ] = new Date(currentDate);
      component.blockchainDataProductOrder = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };

      const unsubscribeDialogSubscription = jasmine.createSpy();
      component.unsubscribeDialogSubscription = unsubscribeDialogSubscription;

      component.rateOrder();

      expect(unsubscribeDialogSubscription.calls.count()).toBe(1);
    });

    it('should assign dialog afterClose subscription to dialogSubscription', () => {
      component[ 'date' ] = new Date(currentDate);
      component.blockchainDataProductOrder = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };

      expect(component[ 'dialogSubscription' ]).toBeUndefined();

      component.rateOrder();

      expect(component[ 'dialogSubscription' ]).not.toBeUndefined();
    });
  });

  describe('#onTransactionFinish()', () => {
    it('should finalise transaction when transactionReceipt.status is successful', () => {
      component.pendingTransaction = {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.Rate
      } as Transaction;

      component.blockchainDataProductOrder = <any> {};
      component.selectedRating = new BigNumber(3);
      component.onTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(component.blockchainDataProductOrder.rating).toEqual(component.selectedRating);
      expect(component.pendingTransaction).toBe(undefined);
    });
  });

  describe('#onTransactionsListChange()', () => {
    it('should set pendingTransaction when transaction list contains related transaction', async () => {
      const transactions = [ {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.Rate
      } ];

      expect(component.pendingTransaction).toBe(undefined);

      await component.onTransactionsListChange(transactions as Transaction[]);

      expect(component.pendingTransaction).not.toBe(undefined);
    });

    it('should call onTransactionFinish when transaction list not contains related transaction', async () => {
      const onTransactionFinish = jasmine.createSpy();
      component.onTransactionFinish = onTransactionFinish;

      component.pendingTransaction = {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.Rate
      } as Transaction;

      await component.onTransactionsListChange([]);

      expect(onTransactionFinish.calls.count()).toBe(1);
      expect(onTransactionFinish.calls.allArgs()[ 0 ]).toEqual([ { status: TransactionStatus.SUCCESSFUL } ]);
    });
  });

  describe('#saveRating()', () => {
    it('should call dataProductService.cancelDataProductPurchase using commonDialogService.transaction', () => {
      const rate = new BigNumber(1);
      const address = '0x00';

      component[ 'date' ] = new Date(currentDate);
      component.blockchainDataProductOrder = <any> {
        rating: new BigNumber(0),
        rateDeadline: new Date(currentDate + second),
        finalised: true
      };

      component.saveRating(rate);

      expect(dataProductServiceSpy.rateDataProductPurchase.calls.count()).toBe(1);
      expect(dataProductServiceSpy.rateDataProductPurchase.calls.allArgs()[ 0 ]).toEqual([ address, rate ]);
    });
  });
});
