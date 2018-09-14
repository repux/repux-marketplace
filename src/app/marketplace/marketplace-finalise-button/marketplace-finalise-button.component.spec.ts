import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import Wallet from '../../shared/models/wallet';
import { from } from 'rxjs';
import { MarketplaceFinaliseButtonComponent } from './marketplace-finalise-button.component';
import { RepuxLibService } from '../../services/repux-lib.service';
import { TaskManagerService } from '../../services/task-manager.service';
import { DataProductService } from '../../services/data-product.service';
import { MaterialModule } from '../../material.module';
import { PendingFinalisationService } from '../services/pending-finalisation.service';
import { TagManagerService } from '../../shared/services/tag-manager.service';
import { WalletService } from '../../services/wallet.service';
import { EventType } from 'repux-lib';
import { DataProductOrder as BlockchainDataProductOrder, TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { KeyStoreDialogService } from '../../key-store/key-store-dialog.service';
import BigNumber from 'bignumber.js';
import { EthTransactionLinkComponent } from '../../shared/components/eth-transaction-link/eth-transaction-link.component';

describe('MarketplaceFinaliseButtonComponent', () => {
  let component: MarketplaceFinaliseButtonComponent;
  let fixture: ComponentFixture<MarketplaceFinaliseButtonComponent>;
  let matDialogSpy, repuxLibServiceSpy, taskManagerServiceSpy, commonDialogServiceSpy, keyStoreDialogServiceSpy,
    dataProductServiceSpy, pendingFinalisationServiceSpy, tagManagerSpy, walletServiceSpy, transactionServiceSpy;
  const ownerAddress = '0x0000000000000000000000000000000000000000';
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x2222222222222222222222222222222222222222';
  const sellerAddress = '0x33';
  const orderAddress = '0x44';
  const buyerPublicKey = 'PUBLIC_KEY';
  const sellerMetaHash = 'META_HASH';

  beforeEach(fakeAsync(() => {
    tagManagerSpy = jasmine.createSpyObj('TagManagerService', [ 'sendEvent' ]);
    matDialogSpy = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    taskManagerServiceSpy = jasmine.createSpyObj('TaskManagerService', [ 'addTask' ]);
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'finaliseDataProductPurchase', 'getOrderData' ]);
    pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'getEntries', 'removeOrder' ]);
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);

    transactionServiceSpy = jasmine.createSpyObj('TransactionService', [ 'getTransactionReceipt', 'getTransactions' ]);
    transactionServiceSpy.getTransactionReceipt.and.returnValue(Promise.resolve({ status: TransactionStatus.SUCCESSFUL }));
    transactionServiceSpy.getTransactions.and.returnValue({
      subscribe() {
      }
    });

    commonDialogServiceSpy = jasmine.createSpyObj('CommonDialogService', [ 'transaction' ]);
    keyStoreDialogServiceSpy = jasmine.createSpyObj('KeyStoreDialogServiceSpy', [ 'getKeys' ]);

    repuxLibServiceSpy.getInstance.and.returnValue({
      deserializePublicKey(key) {
        return 'DESERIALIZED_' + key;
      },
      createFileReencryptor() {
      }
    });

    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(new Wallet(sellerAddress, new BigNumber(1)))));

    dataProductServiceSpy.getOrderData.and.returnValue(Promise.resolve({
      address: orderAddress,
      buyerAddress
    } as BlockchainDataProductOrder));

    dataProductServiceSpy.finaliseDataProductPurchase.and.returnValue({
      subscribe() {
      }
    });

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceFinaliseButtonComponent,
        EthTransactionLinkComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TagManagerService, useValue: tagManagerSpy },
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: RepuxLibService, useValue: repuxLibServiceSpy },
        { provide: TaskManagerService, useValue: taskManagerServiceSpy },
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: PendingFinalisationService, useValue: pendingFinalisationServiceSpy },
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: CommonDialogService, useValue: commonDialogServiceSpy },
        { provide: KeyStoreDialogService, useValue: keyStoreDialogServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceFinaliseButtonComponent);
    component = fixture.componentInstance;

    component.order = <any> {
      buyerAddress,
      publicKey: buyerPublicKey,
      finalised: false,
      buyerPublicKey
    };
    component.dataProduct = <any> {
      address: dataProductAddress,
      fundsToWithdraw: new BigNumber(1),
      sellerMetaHash,
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

  describe('#finalise()', () => {
    it('should call reencrypt method and then sendTransaction method', async () => {
      const buyerMetaHash = 'BUYER_META_HASH';

      const keyPair = {
        privateKey: 'SELLER_PRIVATE_KEY',
        publicKey: 'SELLER_PUBLIC_KEY'
      };

      keyStoreDialogServiceSpy.getKeys.and.returnValue(Promise.resolve(keyPair));

      const reencrypt = jasmine.createSpy();
      reencrypt.and.returnValue(Promise.resolve(buyerMetaHash));
      component.reencrypt = reencrypt;

      const sendTransaction = jasmine.createSpy();
      sendTransaction.and.returnValue(Promise.resolve(buyerMetaHash));
      component.sendTransaction = sendTransaction;

      await component.finalise();

      expect(reencrypt.calls.count()).toBe(1);
      expect(reencrypt.calls.allArgs()[ 0 ]).toEqual([ keyPair.privateKey, 'DESERIALIZED_PUBLIC_KEY' ]);

      expect(sendTransaction.calls.count()).toBe(1);
      expect(sendTransaction.calls.allArgs()[ 0 ]).toEqual([ buyerMetaHash ]);
    });
  });

  describe('#reencrypt()', () => {
    it('should create reencryptor and call reencrypt method on it', async () => {
      const buyerMetaHash = 'BUYER_META_HASH';
      const privateKey = 'PRIVATE_KEY';
      const publicKey = 'PUBLIC_KEY';

      repuxLibServiceSpy.getInstance.and.returnValue({
        createFileReencryptor() {
          return {
            reencrypt() {
              return {
                on(eventType, callback) {
                  if (eventType === EventType.FINISH) {
                    callback(EventType.FINISH, buyerMetaHash);
                  }

                  return this;
                }
              };
            }
          };
        }
      });

      const result = await component.reencrypt(privateKey as JsonWebKey, publicKey as JsonWebKey);
      expect(result).toBe(buyerMetaHash);
    });
  });

  describe('#sendTransaction()', () => {
    it('should call dataProductService.finaliseDataProductPurchase using commonDialogService.transaction', async () => {
      const buyerMetaHash = 'BUYER_META_HASH';

      commonDialogServiceSpy.transaction.and.callFake(methodToCall => methodToCall());

      await component.ngOnInit();
      component.sendTransaction(buyerMetaHash);

      expect(dataProductServiceSpy.finaliseDataProductPurchase.calls.count()).toBe(1);
      expect(dataProductServiceSpy.finaliseDataProductPurchase.calls.allArgs()[ 0 ]).toEqual([
        orderAddress,
        dataProductAddress,
        buyerAddress,
        buyerMetaHash
      ]);
    });
  });

  describe('#onTransactionFinish()', () => {
    it('should finalise transaction when transactionReceipt.status is successful', () => {
      component.pendingTransaction = {
        scope: BlockchainTransactionScope.DataProductOrder,
        identifier: orderAddress,
        blocksAction: ActionButtonType.Finalise
      } as Transaction;

      component.onTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(pendingFinalisationServiceSpy.removeOrder.calls.count()).toBe(1);
      expect(component.order.finalised).toBe(true);
      expect(component.pendingTransaction).toBe(undefined);
    });
  });

  describe('#onTransactionsListChange()', () => {
    it('should set pendingTransaction when transaction list contains related transaction', async () => {
      await component.ngOnInit();

      const transactions = [ {
        scope: BlockchainTransactionScope.DataProductOrder,
        identifier: orderAddress,
        blocksAction: ActionButtonType.Finalise
      } ];

      expect(component.pendingTransaction).toBe(undefined);

      await component.onTransactionsListChange(transactions as Transaction[]);

      expect(component.pendingTransaction).not.toBe(undefined);
    });

    it('should call onTransactionFinish when transaction list not contains related transaction', async () => {
      const onTransactionFinish = jasmine.createSpy();
      component.onTransactionFinish = onTransactionFinish;

      component.pendingTransaction = {
        scope: BlockchainTransactionScope.DataProductOrder,
        identifier: orderAddress,
        blocksAction: ActionButtonType.Finalise
      } as Transaction;

      await component.onTransactionsListChange([]);

      expect(onTransactionFinish.calls.count()).toBe(1);
      expect(onTransactionFinish.calls.allArgs()[ 0 ]).toEqual([ { status: TransactionStatus.SUCCESSFUL } ]);
    });
  });
});
