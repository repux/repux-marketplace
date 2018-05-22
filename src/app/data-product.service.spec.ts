import { DataProductService } from "./data-product.service";
import BigNumber from "bignumber.js";

describe('DataProductService', () => {
  let service: DataProductService;
  let repuxWeb3ServiceSpy;
  const fileHash = 'FILE_HASH';
  const price = new BigNumber(100);
  const rejectError = 'ERROR';

  beforeEach(() => {
    repuxWeb3ServiceSpy = jasmine.createSpyObj(
      'RepuxWeb3Service',
      ['isDefaultAccountAvailable', 'getRepuxApiInstance']
    );
    service = new DataProductService(<any> repuxWeb3ServiceSpy);
  });

  describe('#publishDataProduct()', () => {
    it('should reject promise when isDefaultAccountAvailable returns false', async () => {
      repuxWeb3ServiceSpy.isDefaultAccountAvailable.and.returnValue(false);
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue(Promise.reject(rejectError));
      try {
        await service.publishDataProduct(fileHash, price);
      } catch (error) {
        expect(error).toBeNull();
        expect(repuxWeb3ServiceSpy.isDefaultAccountAvailable.calls.count()).toBe(1);
        expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(1);
      }
    });

    it('should reject promise when isDefaultAccountAvailable returns true and createDataProduct rejects promise', async () => {
      repuxWeb3ServiceSpy.isDefaultAccountAvailable.and.returnValue(true);
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue(Promise.reject(rejectError));
      try {
        await service.publishDataProduct(fileHash, price);
      } catch (error) {
        expect(error).toBe(rejectError);
      }
    });

    it('should resolve promise when getRepuxApiInstance returns resolved promise', async () => {

    });
  })
});
