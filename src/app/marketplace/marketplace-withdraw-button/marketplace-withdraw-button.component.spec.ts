import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import Wallet from '../../shared/models/wallet';
import { from } from 'rxjs';
import { MarketplaceWithdrawButtonComponent } from './marketplace-withdraw-button.component';
import BigNumber from 'bignumber.js';
import { MaterialModule } from '../../material.module';
import { DataProductService } from '../../services/data-product.service';
import { TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { WalletService } from '../../services/wallet.service';
import { EthTransactionLinkComponent } from '../../shared/components/eth-transaction-link/eth-transaction-link.component';

describe('MarketplaceWithdrawButtonComponent', () => {
  let component: MarketplaceWithdrawButtonComponent;
  let fixture: ComponentFixture<MarketplaceWithdrawButtonComponent>;
  let dataProductServiceSpy, unpublishedProductsServiceSpy, commonDialogServiceSpy, transactionServiceSpy, walletServiceSpy;
  const ownerAddress = '0x0000000000000000000000000000000000000000';
  const dataProductAddress = '0x1111111111111111111111111111111111111111';

  beforeEach(fakeAsync(() => {
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'withdrawFundsFromDataProduct' ]);

    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'addProduct' ]);

    commonDialogServiceSpy = jasmine.createSpyObj('CommonDialogService', [ 'transaction' ]);
    commonDialogServiceSpy.transaction.and.callFake(methodToCall => methodToCall());

    transactionServiceSpy = jasmine.createSpyObj('TransactionService', [ 'getTransactionReceipt', 'getTransactions' ]);
    transactionServiceSpy.getTransactionReceipt.and.returnValue(Promise.resolve({ status: TransactionStatus.SUCCESSFUL }));
    transactionServiceSpy.getTransactions.and.returnValue({
      subscribe() {
      }
    });

    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'updateBalance', 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue({
      subscribe() {
      }
    });

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceWithdrawButtonComponent,
        EthTransactionLinkComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsServiceSpy },
        { provide: CommonDialogService, useValue: commonDialogServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: WalletService, useValue: walletServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceWithdrawButtonComponent);
    component = fixture.componentInstance;

    component.blockchainDataProduct = <any> {
      disabled: false,
      fundsAccumulated: new BigNumber(100),
      buyersDeposit: new BigNumber(0)
    };

    component.dataProductAddress = dataProductAddress;
    component.dataProduct = <any> {
      address: dataProductAddress,
      fundsToWithdraw: new BigNumber(100),
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
        blocksAction: ActionButtonType.Withdraw
      } as Transaction;

      component.fundsToWithdraw = new BigNumber(100);

      const addProductToUnpublishedProducts = jasmine.createSpy();
      component.addProductToUnpublishedProducts = addProductToUnpublishedProducts;

      component.onTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(addProductToUnpublishedProducts.calls.count()).toBe(0);
      expect(component.fundsToWithdraw).toEqual(new BigNumber(0));
      expect(component.pendingTransaction).toBe(undefined);
    });

    it('should finalise transaction when transactionReceipt.status is successful and should call ' +
      'addProductToUnpublishedProducts when disabled = true', () => {
      component.blockchainDataProduct.disabled = true;
      component.pendingTransaction = {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.Withdraw
      } as Transaction;

      component.fundsToWithdraw = new BigNumber(100);

      const addProductToUnpublishedProducts = jasmine.createSpy();
      component.addProductToUnpublishedProducts = addProductToUnpublishedProducts;

      component.onTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(addProductToUnpublishedProducts.calls.count()).toBe(1);
      expect(component.fundsToWithdraw).toEqual(new BigNumber(0));
      expect(component.pendingTransaction).toBe(undefined);
    });
  });

  describe('#onTransactionsListChange()', () => {
    it('should set pendingTransaction when transaction list contains related transaction', async () => {
      const transactions = [ {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: dataProductAddress,
        blocksAction: ActionButtonType.Withdraw
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
        blocksAction: ActionButtonType.Withdraw
      } as Transaction;

      await component.onTransactionsListChange([]);

      expect(onTransactionFinish.calls.count()).toBe(1);
      expect(onTransactionFinish.calls.allArgs()[ 0 ]).toEqual([ { status: TransactionStatus.SUCCESSFUL } ]);
    });
  });

  describe('#withdraw()', () => {
    it('should call dataProductService.withdrawFundsFromDataProduct using commonDialogService.transaction', () => {
      component.withdraw();

      expect(dataProductServiceSpy.withdrawFundsFromDataProduct.calls.count()).toBe(1);
      expect(dataProductServiceSpy.withdrawFundsFromDataProduct.calls.allArgs()[ 0 ]).toEqual([ dataProductAddress ]);
    });
  });
});
