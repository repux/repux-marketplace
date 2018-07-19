import { UnpublishedProductsService } from './unpublished-products.service';

describe('UnpublishedProductsService', () => {
  let service: UnpublishedProductsService;
  let taskManagerServiceSpy, storageServiceSpy;
  const sellerMetaHash = 'SELLER_META_HASH';

  beforeEach(() => {
    taskManagerServiceSpy = jasmine.createSpyObj('TaskManagerService', [ 'removeTask' ]);
    storageServiceSpy = jasmine.createSpyObj('StorageService', [ 'getItem', 'setItem' ]);
    storageServiceSpy.getItem.and.returnValue(null);

    service = new UnpublishedProductsService(<any> taskManagerServiceSpy, <any> storageServiceSpy);
  });

  describe('#constructor()', () => {
    it('should assign result of _readFromStore() to _config', () => {
      expect(service[ '_config' ]).toEqual({ dataProducts: [] });
    });
  });

  describe('#_getStorageKey()', () => {
    it('should always return "UnpublishedProductsService"', () => {
      expect(service[ '_getStorageKey' ]()).toBe('UnpublishedProductsService');
    });
  });

  describe('#addProduct()', () => {
    it('should push product to _config and save it in the store', () => {
      const product = <any> {
        sellerMetaHash
      };
      service.addProduct(product);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 0 ][ 0 ]).toBe('UnpublishedProductsService');
      expect(storageServiceSpy.setItem.calls.allArgs()[ 0 ][ 1 ]).toEqual({ dataProducts: [ product ] });
    });
  });

  describe('#removeProduct()', () => {
    it('should remove product from config and remove task from taskManagerService', () => {
      const task = <any> {
        sellerMetaHash
      };
      taskManagerServiceSpy[ 'tasks' ] = [ task ];
      const product = <any> {
        sellerMetaHash
      };
      service[ '_config' ].dataProducts = [ product ];
      service.removeProduct(product);
      expect(service[ '_config' ].dataProducts).toEqual([]);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 0 ][ 0 ]).toBe('UnpublishedProductsService');
      expect(storageServiceSpy.setItem.calls.allArgs()[ 0 ][ 1 ]).toEqual({ dataProducts: [] });
      expect(taskManagerServiceSpy.removeTask.calls.allArgs()[ 0 ][ 0 ]).toBe(task);
    });
  });
});
