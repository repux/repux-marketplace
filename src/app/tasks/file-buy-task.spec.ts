import { FileBuyTask, STATUS } from './file-buy-task';
import { DataProduct } from '../shared/models/data-product';
import { TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import BigNumber from 'bignumber.js';

describe('FileBuyTask', () => {
  let fileBuyTask, commonDialogServiceSpy, transactionServiceSpy, awaitingFinalisationServiceSpy, keyStoreDialogServiceSpy,
    repuxLibServiceSpy, dataProductServiceSpy, tagManagerServiceSpy, dialogSpy, getTransactionsSpy, taskManagerServiceSpy, walletServiceSpy;
  const buyerAddress = '0x00';
  const dataProduct = <DataProduct> {
    address: '0x01',
    name: 'product name',
    price: new BigNumber(1),
    category: [ 'category' ],
    title: 'title',
    ownerAddress: '0x02'
  };

  beforeEach(() => {
    commonDialogServiceSpy = jasmine.createSpyObj('CommonDialogService', [ 'transaction' ]);
    commonDialogServiceSpy.transaction.and.callFake(methodToCall => methodToCall());

    getTransactionsSpy = jasmine.createSpy();
    transactionServiceSpy = jasmine.createSpyObj('TransactionService', [ 'getTransactions' ]);
    transactionServiceSpy.getTransactions.and.returnValue({
      subscribe: getTransactionsSpy
    });

    awaitingFinalisationServiceSpy = jasmine.createSpyObj('AwaitingFinalisationService', [ 'addProduct' ]);

    keyStoreDialogServiceSpy = jasmine.createSpyObj('KeyStoreDialogServiceSpy', [ 'getKeys' ]);

    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);

    dataProductServiceSpy = jasmine.createSpyObj('DataProductService',
      [ 'purchaseDataProduct', 'approveTokensTransferForDataProductPurchase', 'isTokensTransferForDataProductPurchaseApproved' ]
    );
    dataProductServiceSpy.isTokensTransferForDataProductPurchaseApproved.and.returnValue(Promise.resolve(false));
    dataProductServiceSpy.approveTokensTransferForDataProductPurchase.and.returnValue({
      subscribe() {
      }
    });
    dataProductServiceSpy.purchaseDataProduct.and.returnValue({
      subscribe() {
      }
    });

    tagManagerServiceSpy = jasmine.createSpyObj('TagManagerService', [ 'sendEvent' ]);

    dialogSpy = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    taskManagerServiceSpy = jasmine.createSpyObj('TaskManagerService', [ 'onTaskEvent' ]);

    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'updateBalance' ]);

    fileBuyTask = new FileBuyTask(
      buyerAddress,
      dataProduct,
      commonDialogServiceSpy,
      transactionServiceSpy,
      awaitingFinalisationServiceSpy,
      keyStoreDialogServiceSpy,
      repuxLibServiceSpy,
      dataProductServiceSpy,
      tagManagerServiceSpy,
      walletServiceSpy,
      dialogSpy
    );
  });

  describe('#run()', () => {
    it('should call dataProductService.approveTokensTransferForDataProductPurchase using commonDialogService.transaction', async () => {
      await fileBuyTask.run(taskManagerServiceSpy);

      expect(dataProductServiceSpy.approveTokensTransferForDataProductPurchase.calls.count()).toBe(1);
      expect(dataProductServiceSpy.approveTokensTransferForDataProductPurchase.calls.allArgs()[ 0 ]).toEqual([ dataProduct.address ]);
    });

    it('should call onApproveTransactionFinish if isTokensTransferForDataProductPurchaseApproved return true', async () => {
      const onApproveTransactionFinish = jasmine.createSpy();
      dataProductServiceSpy.isTokensTransferForDataProductPurchaseApproved.and.returnValue(Promise.resolve(true));
      fileBuyTask.onApproveTransactionFinish = onApproveTransactionFinish;

      await fileBuyTask.run(taskManagerServiceSpy);

      expect(onApproveTransactionFinish.calls.count()).toBe(1);
    });
  });

  describe('#onApproveTransactionFinish()', () => {
    it('should call dataProductService.purchaseDataProduct using commonDialogService.transaction', async () => {
      keyStoreDialogServiceSpy.getKeys.and.returnValue(Promise.resolve({ publicKey: 'PUBLIC_KEY' }));

      const serializePublicKey = jasmine.createSpy();
      serializePublicKey.and.callFake(key => 'SERIALIZED_' + key);
      repuxLibServiceSpy.getInstance.and.returnValue({
        serializePublicKey
      });

      fileBuyTask[ '_taskManagerService' ] = taskManagerServiceSpy;

      await fileBuyTask.onApproveTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(dataProductServiceSpy.purchaseDataProduct.calls.count()).toBe(1);
      expect(dataProductServiceSpy.purchaseDataProduct.calls.allArgs()[ 0 ]).toEqual([ dataProduct.address, 'SERIALIZED_PUBLIC_KEY' ]);
    });
  });

  describe('#onTransactionFinish()', () => {
    it('should finalise transaction when transactionReceipt.status is successful', () => {
      fileBuyTask[ '_taskManagerService' ] = taskManagerServiceSpy;

      fileBuyTask.onTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(awaitingFinalisationServiceSpy.addProduct.calls.count()).toBe(1);
      expect(fileBuyTask.finished).toBe(true);
      expect(fileBuyTask.status).toBe(STATUS.FINISHED);
      expect(fileBuyTask.progress).toBe(100);
    });
  });
});
