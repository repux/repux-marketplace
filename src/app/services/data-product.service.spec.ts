import { DataProductService } from './data-product.service';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import { DataProductUpdateAction, TransactionStatus, TransactionReceipt } from '@repux/repux-web3-api';
import Wallet from '../shared/models/wallet';
import { TransactionEvent } from '../shared/models/transaction-event';
import { TransactionEventType } from '../shared/enums/transaction-event-type';

describe('DataProductService', () => {
  let service: DataProductService;
  let repuxWeb3ServiceSpy, walletServiceSpy, websocketServiceSpy, transactionServiceSpy;
  const fileHash = 'FILE_HASH';
  const price = new BigNumber(100);
  const daysToDeliver = 1;
  const rejectError = new Error('ERROR');
  const successfulReceipt = { status: TransactionStatus.SUCCESSFUL } as TransactionReceipt;
  const walletAddress = '0x0000000000000000000000000000000000000000';
  const productAddress = '0x1111111111111111111111111111111111111111';

  beforeEach(() => {
    repuxWeb3ServiceSpy = jasmine.createSpyObj(
      'RepuxWeb3Service',
      [ 'getRepuxApiInstance', 'getWeb3Instance', 'isProviderAvailable', 'isDefaultAccountAvailable' ]
    );
    walletServiceSpy = jasmine.createSpyObj(
      'WalletServiceSpy',
      [ 'getWallet' ]
    );

    const wallet = new Wallet(walletAddress, new BigNumber(1), new BigNumber(1));
    walletServiceSpy.getWallet.and.returnValue({
      subscribe(callback) {
        callback(wallet);
      }
    });
    websocketServiceSpy = jasmine.createSpyObj('WebsocketService', [ 'onEvent' ]);

    transactionServiceSpy = jasmine.createSpyObj('TransactionService', [ 'handleTransaction' ]);
    transactionServiceSpy.handleTransaction.and.callFake(async (subject, _scope, _identifier, _blocksAction, transaction) => {
      try {
        await transaction();
      } catch (error) {
        return subject.next({ type: TransactionEventType.Rejected, error });
      }

      subject.next({ type: TransactionEventType.Mined, receipt: successfulReceipt });
    });

    service = new DataProductService(
      <any> repuxWeb3ServiceSpy,
      <any> walletServiceSpy,
      <any> websocketServiceSpy,
      <any> transactionServiceSpy
    );
  });

  describe('#get api()', () => {
    it('should return result of repuxWeb3Service.getRepuxApiInstance function', (done) => {
      const expectedResult = 'EXPECTED_RESULT';
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue(expectedResult);

      service[ 'api' ].then(api => {
        expect(api).toBe(<any> expectedResult);
        expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(1);
        done();
      });
    });
  });

  describe('#getDataProductData()', () => {
    it('should call getDataProduct on repuxWeb3Api instance', async () => {
      const getDataProduct = jasmine.createSpy();
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({ getDataProduct });
      await service.getDataProductData(productAddress);
      expect(getDataProduct.calls.count()).toBe(1);
      expect(getDataProduct.calls.allArgs()[ 0 ][ 0 ]).toBe(productAddress);
    });
  });

  describe('#getOrderData()', () => {
    it('should call getDataProduct on repuxWeb3Api instance', async () => {
      const getDataProductOrder = jasmine.createSpy();
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({ getDataProductOrder });
      await service.getOrderData(productAddress, walletAddress);
      expect(getDataProductOrder.calls.count()).toBe(1);
      expect(getDataProductOrder.calls.allArgs()[ 0 ][ 0 ]).toBe(productAddress);
      expect(getDataProductOrder.calls.allArgs()[ 0 ][ 1 ]).toBe(walletAddress);
    });
  });

  describe('#publishDataProduct()', () => {
    it('should reject promise when createDataProduct rejects promise', async () => {
      const createDataProduct = jasmine.createSpy();
      createDataProduct.and.returnValue(Promise.reject(rejectError));

      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        createDataProduct
      });

      return new Promise(resolve => {
        service.publishDataProduct(fileHash, price, daysToDeliver).subscribe((event: TransactionEvent) => {
          if (event) {
            expect(event.error).toEqual(rejectError);
            expect(createDataProduct.calls.count()).toBe(1);
            resolve();
          }
        });
      });
    });

    it('should resolve promise when getRepuxApiInstance returns resolved promise', () => {
      const createDataProduct = jasmine.createSpy();
      createDataProduct.and.returnValue(Promise.resolve());

      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        createDataProduct
      });

      return new Promise(resolve => {
        service.publishDataProduct(fileHash, price, daysToDeliver).subscribe((event: TransactionEvent) => {
          if (event) {
            expect(event.receipt).toEqual(successfulReceipt);
            expect(createDataProduct.calls.count()).toBe(1);
            resolve();
          }
        });
      });
    });
  });

  describe('#purchaseDataProduct()', () => {
    it('should resolve promise when getRepuxApiInstance returns resolved promise', () => {
      const buyerPublicKey = 'PUBLIC_KEY';

      const purchaseDataProduct = jasmine.createSpy();
      purchaseDataProduct.and.returnValue(Promise.resolve());

      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        purchaseDataProduct
      });

      return new Promise(resolve => {
        service.purchaseDataProduct(productAddress, buyerPublicKey).subscribe((event: TransactionEvent) => {
          if (event) {
            expect(event.receipt).toEqual(successfulReceipt);
            expect(purchaseDataProduct.calls.count()).toBe(1);
            resolve();
          }
        });
      });
    });
  });

  describe('#finaliseDataProductPurchase()', () => {
    it('should resolve promise when getRepuxApiInstance returns resolved promise', () => {
      const metaHash = 'SOME_HASH';
      const orderAddress = '0x00';

      const finaliseDataProductPurchase = jasmine.createSpy();
      finaliseDataProductPurchase.and.returnValue(Promise.resolve());

      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        finaliseDataProductPurchase
      });

      return new Promise(resolve => {
        service.finaliseDataProductPurchase(orderAddress, productAddress, walletAddress, metaHash).subscribe((event: TransactionEvent) => {
          if (event) {
            expect(event.receipt).toEqual(successfulReceipt);
            expect(finaliseDataProductPurchase.calls.count()).toBe(1);
            resolve();
          }
        });
      });
    });
  });

  describe('#watchForDataProductUpdate()', () => {
    it('should return existing observable when it is defined', () => {
      service[ 'websocketMessage$' ] = new Observable(() => {
      });
      const observable = service.watchForDataProductUpdate(productAddress, DataProductUpdateAction.CREATE);
      expect(observable.subscribe).toBeDefined();
    });

    it('should return new observable when it is not defined', () => {
      websocketServiceSpy.onEvent.and.returnValue(new Observable());
      const observable = service.watchForDataProductUpdate(productAddress, DataProductUpdateAction.CREATE);
      expect(observable.subscribe).toBeDefined();
    });

    it('should emit event when observer push next result', () => {
      service[ 'websocketMessage$' ] = new Observable(observer => {
        observer.next({
          args: {
            dataProduct: productAddress,
            action: DataProductUpdateAction.CREATE,
            sender: walletAddress
          },
          blockNumber: 1
        });
      });

      service.watchForDataProductUpdate(productAddress, DataProductUpdateAction.CREATE)
        .subscribe(result => {
          expect(result.dataProductAddress).toBe(productAddress);
          expect(result.action).toBe(DataProductUpdateAction.CREATE);
        });

      service.watchForDataProductUpdate(productAddress, DataProductUpdateAction.UPDATE)
        .subscribe(() => {
          expect(true).toBeFalsy();
        });

      service.watchForDataProductUpdate(walletAddress, DataProductUpdateAction.CREATE)
        .subscribe(() => {
          expect(true).toBeFalsy();
        });

      service.watchForDataProductUpdate(walletAddress, DataProductUpdateAction.UPDATE)
        .subscribe(() => {
          expect(true).toBeFalsy();
        });
    });
  });
});
