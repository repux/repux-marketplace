import { DataProductService } from './data-product.service';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import { DataProductUpdateAction } from 'repux-web3-api';
import Wallet from '../shared/models/wallet';

describe('DataProductService', () => {
  let service: DataProductService;
  let repuxWeb3ServiceSpy, walletServiceSpy, storageServiceSpy;
  const fileHash = 'FILE_HASH';
  const price = new BigNumber(100);
  const daysForDeliver = 1;
  const rejectError = 'ERROR';
  const resolveResult = 'RESULT';
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
    storageServiceSpy = jasmine.createSpyObj('StorageService', [ 'getItem', 'setItem' ]);
    const wallet = new Wallet(walletAddress, 1);
    walletServiceSpy.getWallet.and.returnValue({
      subscribe(callback) {
        callback(wallet);
      }
    });

    service = new DataProductService(<any> repuxWeb3ServiceSpy, <any> walletServiceSpy, <any> storageServiceSpy);
  });

  describe('#get _api()', () => {
    it('should return result of _repuxWeb3Service.getRepuxApiInstance function', () => {
      const expectedResult = 'EXPECTED_RESULT';
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue(expectedResult);
      expect(service[ '_api' ]).toBe(<any> expectedResult);
      expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(1);
    });
  });

  describe('#_readFromStore()', () => {
    it('should return config from storage', () => {
      const expectedResult = { lastBlock: 12 };
      storageServiceSpy.getItem.and.returnValue(expectedResult);
      const result = service[ '_readFromStore' ]();
      expect(<any> result).toEqual(expectedResult);
    });

    it('should return new config when there is none in storage', () => {
      storageServiceSpy.getItem.and.returnValue(null);
      const result = service[ '_readFromStore' ]();
      expect(<any> result).toEqual({ lastBlock: 0 });
    });
  });

  describe('#_saveToStore()', () => {
    it('should call set item on storage', () => {
      service[ '_saveToStore' ]({ lastBlock: 12 });
      expect(storageServiceSpy.setItem.calls.count()).toBe(1);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 0 ][ 1 ]).toEqual({ lastBlock: 12 });
    });
  });

  describe('#_getLastReadBlock()', () => {
    it('should return lastBlock from config', () => {
      const readFromStore = jasmine.createSpy();
      readFromStore.and.returnValue({ lastBlock: 12 });
      service[ '_readFromStore' ] = readFromStore;
      expect(service[ '_getLastReadBlock' ]()).toBe(12);
    });
  });

  describe('#_setLastReadBlock()', () => {
    it('should call set config', () => {
      const readFromStore = jasmine.createSpy();
      const saveToStore = jasmine.createSpy();
      readFromStore.and.returnValue({ lastBlock: 12 });
      service[ '_readFromStore' ] = readFromStore;
      service[ '_saveToStore' ] = saveToStore;
      service[ '_setLastReadBlock' ](13);
      expect(saveToStore.calls.count()).toBe(1);
      expect(saveToStore.calls.allArgs()[ 0 ][ 0 ]).toEqual({ lastBlock: 13 });
    });
  });

  describe('#_getDebouncedPromise()', () => {
    it('should return promise if it exists in _promises array', () => {
      const expectedResult = Promise.resolve([ 'PRODUCT' ]);
      service[ '_promises' ][ 'boughtData' ] = expectedResult;
      expect(service[ '_getDebouncedPromise' ]('boughtData', 'getBoughtDataProducts')).toEqual(expectedResult);
    });

    it('should return new promise if it doesn\'t exists in _promises array', () => {
      const expectedResult = Promise.resolve([ 'PRODUCT' ]);
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        getBoughtDataProducts() {
          return expectedResult;
        }
      });
      expect(service[ '_getDebouncedPromise' ]('boughtData', 'getBoughtDataProducts')).toEqual(expectedResult);
    });
  });

  describe('#getDataProductData()', () => {
    it('should call getDataProduct on repuxWeb3Api instance', () => {
      const getDataProduct = jasmine.createSpy();
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({ getDataProduct });
      service.getDataProductData(productAddress);
      expect(getDataProduct.calls.count()).toBe(1);
      expect(getDataProduct.calls.allArgs()[ 0 ][ 0 ]).toBe(productAddress);
    });
  });

  describe('#getTransactionData()', () => {
    it('should call getDataProduct on repuxWeb3Api instance', () => {
      const getDataProductTransaction = jasmine.createSpy();
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({ getDataProductTransaction });
      service.getTransactionData(productAddress, walletAddress);
      expect(getDataProductTransaction.calls.count()).toBe(1);
      expect(getDataProductTransaction.calls.allArgs()[ 0 ][ 0 ]).toBe(productAddress);
      expect(getDataProductTransaction.calls.allArgs()[ 0 ][ 1 ]).toBe(walletAddress);
    });
  });

  describe('#publishDataProduct()', () => {
    it('should reject promise when createDataProduct rejects promise', async () => {
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        createDataProduct: () => Promise.reject(rejectError)
      });
      try {
        await service.publishDataProduct(fileHash, price, daysForDeliver);
      } catch (error) {
        expect(error).toBe(rejectError);
        expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(1);
      }
    });

    it('should resolve promise when getRepuxApiInstance returns resolved promise', async () => {
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        createDataProduct: () => Promise.resolve(resolveResult)
      });
      const result = await service.publishDataProduct(fileHash, price, daysForDeliver);
      expect(result).toBe(<any> resolveResult);
      expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(1);
    });
  });

  describe('#purchaseDataProduct()', () => {
    it('should call purchaseDataProduct on repuxWeb3Api instance', () => {
      const buyerPublicKey = 'PUBLIC_KEY';
      const purchaseDataProduct = jasmine.createSpy();
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({ purchaseDataProduct });
      service.purchaseDataProduct(productAddress, buyerPublicKey);
      expect(purchaseDataProduct.calls.count()).toBe(1);
      expect(purchaseDataProduct.calls.allArgs()[ 0 ][ 0 ]).toBe(productAddress);
      expect(purchaseDataProduct.calls.allArgs()[ 0 ][ 1 ]).toBe(buyerPublicKey);
    });
  });

  describe('#finaliseDataProductPurchase()', () => {
    it('should call finaliseDataProductPurchase on repuxWeb3Api instance', () => {
      const metaHash = 'SOME_HASH';
      const finaliseDataProductPurchase = jasmine.createSpy();
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({ finaliseDataProductPurchase });
      service.finaliseDataProductPurchase(productAddress, walletAddress, metaHash);
      expect(finaliseDataProductPurchase.calls.count()).toBe(1);
      expect(finaliseDataProductPurchase.calls.allArgs()[ 0 ][ 0 ]).toBe(productAddress);
      expect(finaliseDataProductPurchase.calls.allArgs()[ 0 ][ 1 ]).toBe(walletAddress);
      expect(finaliseDataProductPurchase.calls.allArgs()[ 0 ][ 2 ]).toBe(metaHash);
    });
  });

  describe('#getBoughtDataProducts()', () => {
    it('should call _getDebouncedPromise', async () => {
      const expectedResult = [];
      const getDebouncedPromise = jasmine.createSpy();
      getDebouncedPromise.and.returnValue(Promise.resolve(expectedResult));
      service[ '_getDebouncedPromise' ] = getDebouncedPromise;
      const result = await service.getBoughtDataProducts();
      expect(result).toEqual(<any> expectedResult);
      expect(getDebouncedPromise.calls.count()).toBe(1);
      expect(getDebouncedPromise.calls.allArgs()[ 0 ][ 0 ]).toBe('boughtData');
      expect(getDebouncedPromise.calls.allArgs()[ 0 ][ 1 ]).toBe('getBoughtDataProducts');
    });
  });

  describe('#getBoughtAndFinalisedDataProducts()', () => {
    it('should call _getDebouncedPromise', async () => {
      const expectedResult = [];
      const getDebouncedPromise = jasmine.createSpy();
      getDebouncedPromise.and.returnValue(Promise.resolve(expectedResult));
      service[ '_getDebouncedPromise' ] = getDebouncedPromise;
      const result = await service.getBoughtAndFinalisedDataProducts();
      expect(result).toEqual(<any> expectedResult);
      expect(getDebouncedPromise.calls.count()).toBe(1);
      expect(getDebouncedPromise.calls.allArgs()[ 0 ][ 0 ]).toBe('boughtAndFinalisedData');
      expect(getDebouncedPromise.calls.allArgs()[ 0 ][ 1 ]).toBe('getBoughtAndFinalisedDataProducts');
    });
  });

  describe('#getCreatedDataProducts()', () => {
    it('should call _getDebouncedPromise', async () => {
      const expectedResult = [];
      const getDebouncedPromise = jasmine.createSpy();
      getDebouncedPromise.and.returnValue(Promise.resolve(expectedResult));
      service[ '_getDebouncedPromise' ] = getDebouncedPromise;
      const result = await service.getCreatedDataProducts();
      expect(result).toEqual(<any> expectedResult);
      expect(getDebouncedPromise.calls.count()).toBe(1);
      expect(getDebouncedPromise.calls.allArgs()[ 0 ][ 0 ]).toBe('createdData');
      expect(getDebouncedPromise.calls.allArgs()[ 0 ][ 1 ]).toBe('getCreatedDataProducts');
    });
  });

  describe('#watchForDataProductUpdate()', () => {
    it('should return existing observable when it is defined', () => {
      service[ '_dataProductUpdateObservable' ] = new Observable(() => {
      });
      const observable = service.watchForDataProductUpdate(productAddress, DataProductUpdateAction.CREATE);
      expect(observable.subscribe).toBeDefined();
    });

    it('should return new observable when it is not defined', () => {
      const observable = service.watchForDataProductUpdate(productAddress, DataProductUpdateAction.CREATE);
      expect(observable.subscribe).toBeDefined();
    });

    it('should emit event when observer push next result', () => {
      service[ '_dataProductUpdateObservable' ] = new Observable(observer => {
        observer.next({
          dataProductAddress: productAddress,
          action: DataProductUpdateAction.CREATE
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
