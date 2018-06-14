import { DataProductService } from './data-product.service';
import BigNumber from 'bignumber.js';

describe('DataProductService', () => {
  let service: DataProductService;
  let repuxWeb3ServiceSpy, walletServiceSpy;
  const fileHash = 'FILE_HASH';
  const price = new BigNumber(100);
  const rejectError = 'ERROR';
  const resolveResult = 'RESULT';
  const walletAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(() => {
    repuxWeb3ServiceSpy = jasmine.createSpyObj(
      'RepuxWeb3Service',
      [ 'getRepuxApiInstance', 'getWeb3Instance', 'isProviderAvailable', 'isDefaultAccountAvailable' ]
    );
    walletServiceSpy = jasmine.createSpyObj(
      'WalletServiceSpy',
      [ 'getWalletData' ]
    );
    walletServiceSpy.getWalletData.and.returnValue({
      address: walletAddress
    });
    service = new DataProductService(<any> repuxWeb3ServiceSpy, <any> walletServiceSpy);
  });

  describe('#get _api()', () => {
    it('should return result of _repuxWeb3Service.getRepuxApiInstance function', () => {
      const expectedResult = 'EXPECTED_RESULT';
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue(expectedResult);
      expect(service['_api']).toBe(expectedResult);
      expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(1);
    });
  });

  describe('#_getConfig()', () => {
    it('should return config from storage', async () => {
      const storage = jasmine.createSpyObj('localStorage', [ 'getItem', 'setItem' ]);
      storage.getItem.and.returnValue(`{"lastBlock": 12, "address": "${walletAddress}"}`);
      service[ '_storage' ] = storage;
      const result = await service[ '_getConfig' ]();
      expect(<any> result).toEqual({
        lastBlock: 12,
        address: walletAddress
      });
    });

    it('should return new config when wallet address is different than address in config', async () => {
      const storage = jasmine.createSpyObj('localStorage', [ 'getItem', 'setItem' ]);
      storage.getItem.and.returnValue(`{"lastBlock": 12, "address": "0x1"}`);
      service[ '_storage' ] = storage;
      const result = await service[ '_getConfig' ]();
      expect(<any> result).toEqual({
        lastBlock: 0,
        address: walletAddress
      });
    });

    it('should return new config when there is none in storage', async () => {
      const storage = jasmine.createSpyObj('localStorage', [ 'getItem', 'setItem' ]);
      storage.getItem.and.returnValue(null);
      service[ '_storage' ] = storage;
      const result = await service[ '_getConfig' ]();
      expect(<any> result).toEqual({
        lastBlock: 0,
        address: walletAddress
      });
    });
  });

  describe('#_setConfig()', () => {
    it('should call set item on storage', async () => {
      const storage = jasmine.createSpyObj('localStorage', [ 'getItem', 'setItem' ]);
      service['_storage'] = storage;
      await service['_setConfig']({ lastBlock: 12 });
      expect(storage.setItem.calls.count()).toBe(1);
      expect(storage.setItem.calls.allArgs()[ 0 ][ 1 ]).toBe(`{"lastBlock":12,"address":"${walletAddress}"}`);
    });
  });

  describe('#_getLastReadBlock()', () => {
    it('should return lastBlock from config', async() => {
      const getConfig = jasmine.createSpy();
      getConfig.and.returnValue(Promise.resolve({ lastBlock: 12 }));
      service['_getConfig'] = getConfig;
      expect(await service['_getLastReadBlock']()).toBe(12);
    });
  });

  describe('#publishDataProduct()', () => {
    it('should reject promise when createDataProduct rejects promise', async () => {
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        createDataProduct: () => Promise.reject(rejectError)
      });
      try {
        await service.publishDataProduct(fileHash, price);
      } catch (error) {
        expect(error).toBe(rejectError);
        expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(1);
      }
    });

    it('should resolve promise when getRepuxApiInstance returns resolved promise', async () => {
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue({
        createDataProduct: () => Promise.resolve(resolveResult)
      });
      const result = await service.publishDataProduct(fileHash, price);
      expect(result).toBe(<any> resolveResult);
      expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(1);
    });
  });
});
