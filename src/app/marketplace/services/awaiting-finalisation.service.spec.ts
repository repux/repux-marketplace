import { AwaitingFinalisationService, getAwaitingFinalisationDataProductsQuery } from './awaiting-finalisation.service';
import Wallet from '../../shared/models/wallet';
import { DataProduct } from '../../shared/models/data-product';
import { from } from 'rxjs';
import { EsDataProduct } from '../../shared/models/es-data-product';
import { Observable } from 'rxjs/internal/Observable';

describe('AwaitingFinalisationService', () => {
  let service: AwaitingFinalisationService;
  let walletServiceSpy, dataProductServiceSpy, dataProductListServiceSpy;

  const wallet = new Wallet('0x00', 0);
  const dataProduct = new DataProduct();
  const esDataProduct = new EsDataProduct();
  esDataProduct.source = dataProduct;

  beforeEach(() => {
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(wallet)));

    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'watchForDataProductUpdate' ]);
    dataProductServiceSpy.watchForDataProductUpdate.and.returnValue(new Observable());

    dataProductListServiceSpy = jasmine.createSpyObj('DataProductListService', [ 'getDataProducts' ]);
    dataProductListServiceSpy.getDataProducts.and.callFake(() => {
      return from(Promise.resolve({ hits: [] }));
    });

    service = new AwaitingFinalisationService(
      <any> walletServiceSpy,
      <any> dataProductServiceSpy,
      <any> dataProductListServiceSpy
    );
  });

  describe('#getProducts()', () => {
    it('should return products observable', () => {
      return new Promise(resolve => {
        service.getProducts().subscribe(result => {
          expect(<any> result).toEqual([]);
          resolve();
        });
      });
    });
  });

  describe('#getProductsValue()', () => {
    it('should return products array', () => {
      expect(service.getProductsValue()).toEqual([]);
    });
  });

  describe('#refresh()', () => {
    it('should fetch DataProducts with proper query', () => {
      return new Promise(resolve => {
        let callNumber = 0;

        service.getProducts().subscribe(result => {
          if (callNumber === 1) {
            expect(<any> result).toEqual([ dataProduct ]);
            resolve();
          }

          callNumber++;
        });


        dataProductListServiceSpy.getDataProducts.and.callFake(() => {
          return from(Promise.resolve({ hits: [ esDataProduct ] }));
        });

        service.refresh(wallet);

        expect(dataProductListServiceSpy.getDataProducts.calls.allArgs()[ 0 ][ 0 ])
          .toEqual(getAwaitingFinalisationDataProductsQuery(wallet.address));
      });
    });
  });

  describe('#addProduct()', () => {
    it('should add product to products', () => {
      expect(service.getProductsValue()).toEqual([]);

      service.addProduct(dataProduct);

      expect(service.getProductsValue()).toEqual([ dataProduct ]);
    });
  });

  describe('#removeProduct()', () => {
    it('should remove product from products', () => {
      service.addProduct(dataProduct);
      expect(service.getProductsValue()).toEqual([ dataProduct ]);

      service.removeProduct(dataProduct);

      expect(service.getProductsValue()).toEqual([]);
    });
  });

  describe('#findProduct()', () => {
    it('should find product by address', () => {
      const dataProductAddress = '0x00';
      dataProduct.address = dataProductAddress;

      expect(service.findProduct(dataProductAddress)).toBeUndefined();

      service.addProduct(dataProduct);
      expect(service.findProduct(dataProductAddress)).toBe(dataProduct);

      expect(service.findProduct('0x11')).toBeUndefined();
    });
  });
});
