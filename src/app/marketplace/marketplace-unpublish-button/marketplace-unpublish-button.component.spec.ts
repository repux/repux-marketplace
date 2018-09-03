import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import Wallet from '../../shared/models/wallet';
import { from } from 'rxjs';
import BigNumber from 'bignumber.js';
import { MarketplaceUnpublishButtonComponent } from './marketplace-unpublish-button.component';
import { MaterialModule } from '../../material.module';
import { DataProductService } from '../../services/data-product.service';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { WalletService } from '../../services/wallet.service';

describe('MarketplaceUnpublishButtonComponent', () => {
  let component: MarketplaceUnpublishButtonComponent;
  let fixture: ComponentFixture<MarketplaceUnpublishButtonComponent>;
  let dataProductServiceSpy, unpublishedProductsServiceSpy, commonDialogServiceSpy, transactionServiceSpy;
  const ownerAddress = '0x0000000000000000000000000000000000000000';
  const dataProductAddress = '0x1111111111111111111111111111111111111111';

  beforeEach(fakeAsync(() => {
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'disableDataProduct' ]);

    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'addProduct' ]);

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
        MarketplaceUnpublishButtonComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsServiceSpy },
        { provide: CommonDialogService, useValue: commonDialogServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceUnpublishButtonComponent);
    component = fixture.componentInstance;

    component.blockchainDataProduct = <any> {
      disabled: false,
      fundsAccumulated: new BigNumber(10),
      buyersDeposit: new BigNumber(10)
    };

    component.dataProductAddress = dataProductAddress;
    component.dataProduct = <any> {
      address: dataProductAddress,
      fundsToWithdraw: new BigNumber(1),
      ownerAddress,
      orders: []
    };
    fixture.detectChanges();
  }));

  describe('#ngOnInit()', () => {
    it('should call onWalletChange', async () => {
      const wallet = new Wallet(ownerAddress, new BigNumber(0));
      const getWallet = jasmine.createSpy();
      getWallet.and.returnValue(from(Promise.resolve(wallet)));
      const onWalletChange = jasmine.createSpy();
      component[ 'onWalletChange' ] = onWalletChange;
      component[ 'walletService' ] = <any> {
        getWallet
      };

      await component.ngOnInit();
      expect(onWalletChange.calls.count()).toBe(1);
      expect(onWalletChange.calls.allArgs()[ 0 ][ 0 ]).toBe(wallet);
    });
  });

  describe('#onWalletChange()', () => {
    it('should set wallet', () => {
      const wallet = new Wallet(ownerAddress, new BigNumber(0));
      component[ 'onWalletChange' ](wallet);
      expect(component[ 'wallet' ]).toBe(wallet);
      component[ 'onWalletChange' ](wallet);
      expect(component[ 'wallet' ]).toBe(wallet);
      component[ 'onWalletChange' ](null);
      expect(component[ 'wallet' ]).toBe(wallet);
      const wallet2 = new Wallet(ownerAddress, new BigNumber(0));
      component[ 'onWalletChange' ](wallet2);
      expect(component[ 'wallet' ]).toBe(wallet2);
    });
  });

  describe('#onTransactionFinish()', () => {
    it('should finalise transaction when transactionReceipt.status is successful', () => {
      component.pendingTransaction = {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.Unpublish
      } as Transaction;

      const addProductToUnpublishedProducts = jasmine.createSpy();
      component.addProductToUnpublishedProducts = addProductToUnpublishedProducts;

      component.onTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(addProductToUnpublishedProducts.calls.count()).toBe(1);
      expect(component.blockchainDataProduct.disabled).toBe(true);
      expect(component.pendingTransaction).toBe(undefined);
    });

    it('should finalise transaction when transactionReceipt.status is successful and shouldn\'t call ' +
      'addProductToUnpublishedProducts when fundsToWithdraw > 0', () => {
      component.blockchainDataProduct.buyersDeposit = new BigNumber(0);

      component.pendingTransaction = {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.Unpublish
      } as Transaction;

      const addProductToUnpublishedProducts = jasmine.createSpy();
      component.addProductToUnpublishedProducts = addProductToUnpublishedProducts;

      component.onTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(addProductToUnpublishedProducts.calls.count()).toBe(0);
      expect(component.blockchainDataProduct.disabled).toBe(true);
      expect(component.pendingTransaction).toBe(undefined);
    });
  });

  describe('#onTransactionsListChange()', () => {
    it('should set pendingTransaction when transaction list contains related transaction', async () => {
      const transactions = [ {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.Unpublish
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
        blocksAction: ActionButtonType.Unpublish
      } as Transaction;

      await component.onTransactionsListChange([]);

      expect(onTransactionFinish.calls.count()).toBe(1);
      expect(onTransactionFinish.calls.allArgs()[ 0 ]).toEqual([ { status: TransactionStatus.SUCCESSFUL } ]);
    });
  });

  describe('#unpublish()', () => {
    it('should call dataProductService.cancelDataProductPurchase using commonDialogService.transaction', () => {
      component.unpublish();

      expect(dataProductServiceSpy.disableDataProduct.calls.count()).toBe(1);
      expect(dataProductServiceSpy.disableDataProduct.calls.allArgs()[ 0 ]).toEqual([ dataProductAddress ]);
    });
  });

  describe('#addProductToUnpublishedProducts()', () => {
    it('should add copy of dataProduct to unpublishedProductService', () => {
      const dataProduct = {
        price: new BigNumber(1),
        address: '0x00',
        blockchainState: {},
        orders: []
      };

      component.addProductToUnpublishedProducts(<any> dataProduct);
      expect(dataProduct.price).toEqual(new BigNumber(1));
      expect(dataProduct.address).toBe('0x00');
      expect(dataProduct.blockchainState).toEqual({});
      expect(dataProduct.orders).toEqual([]);
      expect(unpublishedProductsServiceSpy.addProduct.calls.count()).toBe(1);
      expect(unpublishedProductsServiceSpy.addProduct.calls.allArgs()[ 0 ][ 0 ]).toEqual({ price: new BigNumber(1) });
    });
  });
});
