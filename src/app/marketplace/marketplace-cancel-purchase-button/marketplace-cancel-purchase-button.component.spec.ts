import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { DataProductService } from '../../services/data-product.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WalletService } from '../../services/wallet.service';
import { MarketplaceCancelPurchaseButtonComponent } from './marketplace-cancel-purchase-button.component';
import { ClockService } from '../../services/clock.service';
import Wallet from '../../shared/models/wallet';
import { MaterialModule } from '../../material.module';
import { AwaitingFinalisationService } from '../services/awaiting-finalisation.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { DataProductOrder as BlockchainDataProductOrder, TransactionStatus, TransactionReceipt } from '@repux/repux-web3-api';
import BigNumber from 'bignumber.js';
import { EthTransactionLinkComponent } from '../../shared/components/eth-transaction-link/eth-transaction-link.component';

describe('MarketplaceCancelPurchaseButtonComponent', () => {
  let component: MarketplaceCancelPurchaseButtonComponent;
  let fixture: ComponentFixture<MarketplaceCancelPurchaseButtonComponent>;
  let walletServiceSpy, dataProductServiceSpy, clockServiceSpy, awaitingFinalisationServiceSpy, commonDialogServiceSpy,
    transactionServiceSpy;
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(fakeAsync(() => {
    clockServiceSpy = jasmine.createSpyObj('ClockService', [ 'onEachSecond' ]);
    clockServiceSpy.onEachSecond.and.returnValue({
      subscribe() {
      }
    });
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet', 'updateBalance' ]);
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

    commonDialogServiceSpy = jasmine.createSpyObj('CommonDialogService', [ 'transaction' ]);
    commonDialogServiceSpy.transaction.and.callFake(methodToCall => methodToCall());

    transactionServiceSpy = jasmine.createSpyObj('TransactionService', [ 'getTransactionReceipt', 'getTransactions' ]);
    transactionServiceSpy.getTransactionReceipt.and.returnValue(Promise.resolve({ status: TransactionStatus.SUCCESSFUL }));
    transactionServiceSpy.getTransactions.and.returnValue({
      subscribe() {
      }
    });

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceCancelPurchaseButtonComponent,
        EthTransactionLinkComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: ClockService, useValue: clockServiceSpy },
        { provide: AwaitingFinalisationService, useValue: awaitingFinalisationServiceSpy },
        { provide: CommonDialogService, useValue: commonDialogServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceCancelPurchaseButtonComponent);
    component = fixture.componentInstance;

    component.dataProduct = <any> {
      address: dataProductAddress,
      orders: [ {
        buyerAddress,
        finalised: false
      } ]
    };

    component.blockchainDataProductOrder = <BlockchainDataProductOrder> {};

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
    it('should return true if order object is truthy', () => {
      component.blockchainDataProductOrder = null;
      expect(component.userIsBuyer).toBeFalsy();
      component.blockchainDataProductOrder = <any> {};
      expect(component.userIsBuyer).toBeTruthy();
    });
  });

  describe('#onTransactionFinish()', () => {
    it('should finalise transaction when transactionReceipt.status is successful', () => {
      component.pendingTransaction = {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.CancelPurchase
      } as Transaction;

      component.onTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(awaitingFinalisationServiceSpy.removeProduct.calls.count()).toBe(1);
      expect(component.blockchainDataProductOrder).toBe(undefined);
      expect(component.pendingTransaction).toBe(undefined);
      expect(walletServiceSpy.updateBalance.calls.count()).toBe(1);
    });
  });

  describe('#onTransactionsListChange()', () => {
    it('should set pendingTransaction when transaction list contains related transaction', async () => {
      const transactions = [ {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.CancelPurchase
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
        blocksAction: ActionButtonType.CancelPurchase
      } as Transaction;

      await component.onTransactionsListChange([]);

      expect(onTransactionFinish.calls.count()).toBe(1);
      expect(onTransactionFinish.calls.allArgs()[ 0 ]).toEqual([ { status: TransactionStatus.SUCCESSFUL } ]);
    });
  });

  describe('#cancelPurchase()', () => {
    it('should call dataProductService.cancelDataProductPurchase using commonDialogService.transaction', () => {
      component.cancelPurchase();

      expect(dataProductServiceSpy.cancelDataProductPurchase.calls.count()).toBe(1);
      expect(dataProductServiceSpy.cancelDataProductPurchase.calls.allArgs()[ 0 ]).toEqual([ dataProductAddress ]);
    });
  });

  describe('#ngOnDestroy()', () => {
    it('should unsubscribe from all subscriptions', () => {
      const clockSubscription = { unsubscribe: jasmine.createSpy() };
      const walletSubscription = { unsubscribe: jasmine.createSpy() };
      const awaitingFinalisationSubscription = { unsubscribe: jasmine.createSpy() };
      component[ 'clockSubscription' ] = <any> clockSubscription;
      component[ 'walletSubscription' ] = <any> walletSubscription;
      component[ 'awaitingFinalisationSubscription' ] = <any> awaitingFinalisationSubscription;

      component.ngOnDestroy();
      expect(clockSubscription.unsubscribe.calls.count()).toBe(1);
      expect(walletSubscription.unsubscribe.calls.count()).toBe(1);
      expect(awaitingFinalisationSubscription.unsubscribe.calls.count()).toBe(1);
    });
  });

  describe('#onWalletChange()', () => {
    it('should set wallet', () => {
      const wallet = new Wallet(buyerAddress, new BigNumber(1), new BigNumber(1));

      component[ 'onWalletChange' ](wallet);
      expect(component.wallet).toBe(wallet);
    });
  });

  describe('#checkIfAfterDeliveryDeadline()', () => {
    it('should return true when date from argument is greater than order.deliveryDeadline', () => {
      const fakeCurrentDate = new Date(1530542099000);
      const deliveryDeadlineAfterCurrent = new Date(1530542100000);
      const deliveryDeadlineBeforeCurrent = new Date(1530542098000);

      component.blockchainDataProductOrder = null;
      expect(component.checkIfAfterDeliveryDeadline(fakeCurrentDate)).toBe(false);

      component.blockchainDataProductOrder = <any> { deliveryDeadline: deliveryDeadlineAfterCurrent };
      expect(component.checkIfAfterDeliveryDeadline(fakeCurrentDate)).toBe(false);

      component.blockchainDataProductOrder = <any> { deliveryDeadline: deliveryDeadlineBeforeCurrent };
      expect(component.checkIfAfterDeliveryDeadline(fakeCurrentDate)).toBe(true);

      component.blockchainDataProductOrder = <any> { deliveryDeadline: fakeCurrentDate };
      expect(component.checkIfAfterDeliveryDeadline(fakeCurrentDate)).toBe(false);
    });
  });
});
