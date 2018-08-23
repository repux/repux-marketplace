import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import BigNumber from 'bignumber.js';
import { MarketplacePublishButtonComponent } from './marketplace-publish-button.component';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { DataProductService } from '../../services/data-product.service';
import { MaterialModule } from '../../material.module';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DataProduct } from '../../shared/models/data-product';
import { TagManagerService } from '../../shared/services/tag-manager.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { TaskManagerService } from '../../services/task-manager.service';

describe('MarketplacePublishButtonComponent', () => {
  let component: MarketplacePublishButtonComponent;
  let fixture: ComponentFixture<MarketplacePublishButtonComponent>;
  let tagManagerService, unpublishedProductsServiceSpy, dataProductServiceSpy, commonDialogServiceSpy, transactionServiceSpy,
    taskManagerServiceSpy;
  const ownerAddress = '0x0000000000000000000000000000000000000000';
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const sellerMetaHash = 'SELLER_META_HASH';
  const price = new BigNumber(1);
  const daysToDeliver = 1;

  beforeEach(fakeAsync(() => {
    tagManagerService = jasmine.createSpyObj('TagManagerService', [ 'sendUserId', 'sendEvent' ]);
    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'removeProduct', 'getProducts' ]);
    unpublishedProductsServiceSpy.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ new DataProduct() ]));
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'publishDataProduct' ]);

    commonDialogServiceSpy = jasmine.createSpyObj('CommonDialogService', [ 'transaction', 'alert' ]);
    commonDialogServiceSpy.transaction.and.callFake(methodToCall => methodToCall());

    transactionServiceSpy = jasmine.createSpyObj('TransactionService', [ 'getTransactionReceipt', 'getTransactions' ]);
    transactionServiceSpy.getTransactionReceipt.and.returnValue(Promise.resolve({ status: TransactionStatus.SUCCESSFUL }));
    transactionServiceSpy.getTransactions.and.returnValue({
      subscribe() {
      }
    });

    taskManagerServiceSpy = jasmine.createSpyObj('TaskManagerServiceSpy', [ 'removeTask' ]);
    taskManagerServiceSpy.fileUploadTasks = {
      find: jasmine.createSpy()
    };

    TestBed.configureTestingModule({
      declarations: [
        MarketplacePublishButtonComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TagManagerService, useValue: tagManagerService },
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsServiceSpy },
        { provide: CommonDialogService, useValue: commonDialogServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: TaskManagerService, useValue: taskManagerServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplacePublishButtonComponent);
    component = fixture.componentInstance;

    component.dataProductAddress = dataProductAddress;
    component.dataProduct = <any> {
      name: 'file.txt',
      address: dataProductAddress,
      fundsToWithdraw: new BigNumber(1),
      daysToDeliver,
      price,
      ownerAddress,
      sellerMetaHash,
      orders: []
    };
    fixture.detectChanges();
  }));

  describe('#onTransactionFinish()', () => {
    it('should finalise transaction when transactionReceipt.status is successful', () => {
      component.pendingTransaction = {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: sellerMetaHash,
        blocksAction: ActionButtonType.Publish
      } as Transaction;

      component.onTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(unpublishedProductsServiceSpy.removeProduct.calls.count()).toBe(1);
      expect(component.pendingTransaction).toBe(undefined);
    });
  });

  describe('#onTransactionsListChange()', () => {
    it('should set pendingTransaction when transaction list contains related transaction', async () => {
      const transactions = [ {
        scope: BlockchainTransactionScope.DataProduct,
        identifier: sellerMetaHash,
        blocksAction: ActionButtonType.Publish
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
        identifier: sellerMetaHash,
        blocksAction: ActionButtonType.Publish
      } as Transaction;

      await component.onTransactionsListChange([]);

      expect(onTransactionFinish.calls.count()).toBe(1);
      expect(onTransactionFinish.calls.allArgs()[ 0 ]).toEqual([ { status: TransactionStatus.SUCCESSFUL } ]);
    });
  });

  describe('#publish()', () => {
    it('should call dataProductService.publishDataProduct using commonDialogService.transaction', () => {
      component.publish();

      expect(dataProductServiceSpy.publishDataProduct.calls.count()).toBe(1);
      expect(dataProductServiceSpy.publishDataProduct.calls.allArgs()[ 0 ]).toEqual([
        sellerMetaHash,
        price,
        daysToDeliver
      ]);
    });
  });

  describe('#remove()', () => {
    it('should call unsubscribeTransactionDialog and create confirmation dialog', () => {
      const unsubscribeTransactionDialog = jasmine.createSpy();
      component.unsubscribeTransactionDialog = unsubscribeTransactionDialog;

      commonDialogServiceSpy.alert.and.returnValue({
        afterClosed() {
          return {
            subscribe(callback) {
              callback(true);
            }
          };
        }
      });

      component.remove();

      expect(unsubscribeTransactionDialog.calls.count()).toBe(1);
      expect(commonDialogServiceSpy.alert.calls.count()).toBe(1);
      expect(commonDialogServiceSpy.alert.calls.allArgs()[ 0 ]).toEqual([
        'Are you sure you want to delete product file.txt?',
        'Removing unpublished file',
        'Yes',
        'No'
      ]);
      expect(unpublishedProductsServiceSpy.removeProduct.calls.count()).toBe(1);
      expect(taskManagerServiceSpy.removeTask.calls.count()).toBe(1);
      expect(taskManagerServiceSpy.fileUploadTasks.find.calls.count()).toBe(1);
    });
  });
});
