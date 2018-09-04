import { UnpublishedProductsService } from './unpublished-products.service';
import { from } from 'rxjs';
import Wallet from '../../shared/models/wallet';
import BigNumber from 'bignumber.js';

describe('UnpublishedProductsService', () => {
  let service: UnpublishedProductsService;
  let storageServiceSpy, walletServiceSpy;
  const sellerMetaHash = 'SELLER_META_HASH';
  const wallet = new Wallet('0x00', new BigNumber(1));

  beforeEach(() => {
    storageServiceSpy = jasmine.createSpyObj('StorageService', [ 'getItem', 'setItem' ]);
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    storageServiceSpy.getItem.and.returnValue(null);
    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(wallet)));

    service = new UnpublishedProductsService(<any> storageServiceSpy, <any> walletServiceSpy);
  });

  describe('#onWalletChange()', () => {
    it('should assign result of readFromStore() to config', () => {
      service.onWalletChange(wallet);
      expect(service[ 'config' ]).toEqual({ dataProducts: [] });
    });
  });

  describe('#getStorageKey()', () => {
    it('should always return "UnpublishedProductsService"', () => {
      service.onWalletChange(wallet);
      expect(service[ 'getStorageKey' ]()).toBe('UnpublishedProductsService_' + wallet.address);
    });
  });

  describe('#addProduct()', () => {
    it('should push product to config and save it in the store', () => {
      const product = <any> {
        sellerMetaHash
      };
      service.onWalletChange(wallet);
      service.addProduct(product);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 1 ][ 0 ]).toBe('UnpublishedProductsService_' + wallet.address);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 1 ][ 1 ]).toEqual({ dataProducts: [ product ] });
      expect(service[ 'productsSubject' ].getValue()).toEqual([ product ]);
    });

    it('shouldn\'t push product to productsSubject when wallet.address is different than address in argument', () => {
      const address = '0x11';
      const product = <any> {
        sellerMetaHash
      };
      service.onWalletChange(wallet);
      service.addProduct(product, address);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 2 ][ 0 ]).toBe('UnpublishedProductsService_' + address);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 2 ][ 1 ]).toEqual({ dataProducts: [ product ] });
      expect(service[ 'productsSubject' ].getValue()).toEqual([]);
    });

    it('should push product to productsSubject when wallet.address is the same as address in argument', () => {
      const product = <any> {
        sellerMetaHash
      };
      service.onWalletChange(wallet);
      service.addProduct(product, wallet.address);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 1 ][ 0 ]).toBe('UnpublishedProductsService_' + wallet.address);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 1 ][ 1 ]).toEqual({ dataProducts: [ product ] });
      expect(service[ 'productsSubject' ].getValue()).toEqual([ product ]);
    });
  });

  describe('#removeProduct()', () => {
    it('should remove product from config', () => {
      const product = <any> {
        sellerMetaHash
      };
      service.onWalletChange(wallet);
      service[ 'config' ].dataProducts = [ product ];
      service.removeProduct(product);
      expect(service[ 'config' ].dataProducts).toEqual([]);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 1 ][ 0 ]).toBe('UnpublishedProductsService_' + wallet.address);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 1 ][ 1 ]).toEqual({ dataProducts: [] });
    });
  });
});
