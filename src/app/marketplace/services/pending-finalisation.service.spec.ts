import { PendingFinalisationService, getPendingFinalisationDataProductsQuery } from './pending-finalisation.service';
import Wallet from '../../shared/models/wallet';
import { DataProduct } from '../../shared/models/data-product';
import { from } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { DataProductOrder } from '../../shared/models/data-product-order';
import BigNumber from 'bignumber.js';

describe('PendingFinalisationService', () => {
  let service: PendingFinalisationService;
  let walletServiceSpy, dataProductServiceSpy, dataProductListServiceSpy, myActiveListingsServiceSpy;

  const wallet = new Wallet('0x00', new BigNumber(0), new BigNumber(1));

  const order = new DataProductOrder();
  order.buyerAddress = wallet.address;

  const dataProduct = new DataProduct();
  dataProduct.orders = [ order ];

  beforeEach(() => {
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(wallet)));

    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'watchForDataProductUpdate' ]);
    dataProductServiceSpy.watchForDataProductUpdate.and.returnValue(new Observable());

    dataProductListServiceSpy = jasmine.createSpyObj('DataProductListService', [ 'getDataProducts' ]);
    dataProductListServiceSpy.getDataProducts.and.callFake(() => {
      return from(Promise.resolve({ hits: [] }));
    });

    myActiveListingsServiceSpy = jasmine.createSpyObj('MyActiveListingsServiceSpy', [ 'getProductsValue' ]);
    myActiveListingsServiceSpy.getProductsValue.and.returnValue([]);

    service = new PendingFinalisationService(
      <any> walletServiceSpy,
      <any> dataProductServiceSpy,
      <any> dataProductListServiceSpy,
      <any> myActiveListingsServiceSpy
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

  describe('#getOrders()', () => {
    it('should return orders observable', () => {
      return new Promise(resolve => {
        service.getOrders().subscribe(result => {
          expect(<any> result).toEqual([]);
          resolve();
        });
      });
    });
  });

  describe('#getOrdersValue()', () => {
    it('should return orders array', () => {
      expect(service.getOrdersValue()).toEqual([]);
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
          return from(Promise.resolve({ hits: [ dataProduct ] }));
        });

        service.refresh(wallet);

        expect(dataProductListServiceSpy.getDataProducts.calls.allArgs()[ 0 ][ 0 ])
          .toEqual(getPendingFinalisationDataProductsQuery(wallet.address));
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

  describe('#removeOrder()', () => {
    it('should remove order from orders', () => {
      service.addProduct(dataProduct);
      expect(service.getOrdersValue()).toEqual([ order ]);

      service.removeOrder(dataProduct.address, order.buyerAddress);

      expect(service.getOrdersValue()).toEqual([]);
    });
  });

  describe('#findOrder()', () => {
    it('should find order by address', () => {
      const dataProductAddress = '0x11';
      dataProduct.address = dataProductAddress;
      dataProduct.orders = [ order ];

      expect(service.findOrder(dataProductAddress, wallet.address)).toBeUndefined();

      service.addProduct(dataProduct);

      expect(service.findOrder(dataProductAddress, wallet.address)).toEqual(order);
      expect(service.findOrder('0x00', wallet.address)).toBeUndefined();
      expect(service.findOrder(dataProductAddress, '0x11')).toBeUndefined();
    });
  });
});
