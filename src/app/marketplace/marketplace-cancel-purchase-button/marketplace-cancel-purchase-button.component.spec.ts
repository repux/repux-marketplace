import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { DataProductService } from '../../services/data-product.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WalletService } from '../../services/wallet.service';
import { MarketplaceCancelPurchaseButtonComponent } from './marketplace-cancel-purchase-button.component';
import { ClockService } from '../../services/clock.service';
import Wallet from '../../shared/models/wallet';
import { MaterialModule } from '../../material.module';
import { AwaitingFinalisationService } from '../services/awaiting-finalisation.service';

describe('MarketplaceCancelPurchaseButtonComponent', () => {
  let component: MarketplaceCancelPurchaseButtonComponent;
  let fixture: ComponentFixture<MarketplaceCancelPurchaseButtonComponent>;
  let walletServiceSpy, dataProductServiceSpy, clockServiceSpy, awaitingFinalisationServiceSpy;
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(fakeAsync(() => {
    clockServiceSpy = jasmine.createSpyObj('ClockService', [ 'onEachSecond' ]);
    clockServiceSpy.onEachSecond.and.returnValue({
      subscribe() {
      }
    });
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue({
      subscribe() {
      }
    });
    awaitingFinalisationServiceSpy = jasmine.createSpyObj('AwaitingFinalisationService', [ 'getProducts', 'removeProduct' ]);
    awaitingFinalisationServiceSpy.getProducts.and.returnValue({
      subscribe() {
      }
    });
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'cancelDataProductPurchase' ]);
    TestBed.configureTestingModule({
      declarations: [
        MarketplaceCancelPurchaseButtonComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TransactionDialogComponent, useValue: {} },
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: ClockService, useValue: clockServiceSpy },
        { provide: AwaitingFinalisationService, useValue: awaitingFinalisationServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceCancelPurchaseButtonComponent);
    component = fixture.componentInstance;

    component.dataProduct = <any> {
      address: dataProductAddress,
      transactions: [ {
        buyerAddress,
        finalised: false
      } ]
    };
    fixture.detectChanges();
  }));

  describe('#ngOnInit()', () => {
    it('should subscribe to wallet, notifications and clock services subjects', () => {
      expect(component.dataProductAddress).toBe(dataProductAddress);
      expect(clockServiceSpy.onEachSecond.calls.count()).toBe(1);
      expect(walletServiceSpy.getWallet.calls.count()).toBe(1);
      expect(awaitingFinalisationServiceSpy.getProducts.calls.count()).toBe(1);
    });
  });

  describe('#get userIsBuyer()', () => {
    it('should return true if _transaction object is truthy', () => {
      component.blockchainBuyTransaction = null;
      expect(component.userIsBuyer).toBeFalsy();
      component.blockchainBuyTransaction = <any> {};
      expect(component.userIsBuyer).toBeTruthy();
    });
  });

  describe('#cancelPurchase()', () => {
    it('should create transaction dialog', async () => {
      let callback;
      const expectedResult = 'RESULT';
      const callTransaction = jasmine.createSpy().and.callFake(async function () {
        await this.transaction();
        callback(expectedResult);
      });
      const dialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
      dialog.open.and.returnValue({
        afterClosed() {
          return {
            subscribe(_callback) {
              callback = _callback;
            }
          };
        },
        componentInstance: {
          callTransaction
        }
      });
      component[ '_dialog' ] = <any> dialog;

      component.blockchainBuyTransaction = <any> {
        buyerAddress
      };

      await component.cancelPurchase();
      expect(dialog.open.calls.count()).toBe(1);
      expect(callTransaction.calls.count()).toBe(1);
      expect(component.blockchainBuyTransaction).toBeUndefined();
      expect(dataProductServiceSpy.cancelDataProductPurchase.calls.count()).toBe(1);
    });
  });

  describe('#ngOnDestroy()', () => {
    it('should unsubscribe from all subscriptions', () => {
      const clockSubscription = { unsubscribe: jasmine.createSpy() };
      const walletSubscription = { unsubscribe: jasmine.createSpy() };
      const awaitingFinalisationSubscription = { unsubscribe: jasmine.createSpy() };
      component[ '_clockSubscription' ] = <any> clockSubscription;
      component[ '_walletSubscription' ] = <any> walletSubscription;
      component[ '_awaitingFinalisationSubscription' ] = <any> awaitingFinalisationSubscription;

      component.ngOnDestroy();
      expect(clockSubscription.unsubscribe.calls.count()).toBe(1);
      expect(walletSubscription.unsubscribe.calls.count()).toBe(1);
      expect(awaitingFinalisationSubscription.unsubscribe.calls.count()).toBe(1);
    });
  });

  describe('#_onWalletChange()', () => {
    it('should set wallet', () => {
      const wallet = new Wallet(buyerAddress, 1);

      component[ '_onWalletChange' ](wallet);
      expect(component.wallet).toBe(wallet);
    });
  });

  describe('#checkIfAfterDeliveryDeadline()', () => {
    it('should return true when date from argument is greater than transaction.deliveryDeadline', () => {
      const fakeCurrentDate = new Date(1530542099000);
      const deliveryDeadlineAfterCurrent = new Date(1530542100000);
      const deliveryDeadlineBeforeCurrent = new Date(1530542098000);

      component.blockchainBuyTransaction = null;
      expect(component.checkIfAfterDeliveryDeadline(fakeCurrentDate)).toBe(false);

      component.blockchainBuyTransaction = <any> { deliveryDeadline: deliveryDeadlineAfterCurrent };
      expect(component.checkIfAfterDeliveryDeadline(fakeCurrentDate)).toBe(false);

      component.blockchainBuyTransaction = <any> { deliveryDeadline: deliveryDeadlineBeforeCurrent };
      expect(component.checkIfAfterDeliveryDeadline(fakeCurrentDate)).toBe(true);

      component.blockchainBuyTransaction = <any> { deliveryDeadline: fakeCurrentDate };
      expect(component.checkIfAfterDeliveryDeadline(fakeCurrentDate)).toBe(false);
    });
  });
});
