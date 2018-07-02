import { DataProduct } from './data-product';
import { BigNumber } from 'bignumber.js';

describe('DataProduct', () => {
  describe('#deserialize()', () => {
    it('should assign all values from input to object with some modifications', () => {
      const dataProduct = new DataProduct();
      dataProduct.deserialize({
        title: 'title',
        shortDescription: 'shortDescription',
        fullDescription: 'fullDescription',
        type: 'type',
        category: [ 'category1' ],
        maxNumberOfDownloads: 100,
        price: '199999999999999999999',
        termsOfUseType: 'termsOfUseType',
        name: 'name',
        size: 100,
        ownerAddress: '0x1111',
        lastUpdateTimestamp: 100,
        daysForDeliver: 1,
        fundsToWithdraw: '0',
        transactions: [ {
          finalised: true,
          buyerAddress: '0x11',
          buyerMetaHash: 'BUYER_META_HASH',
          price: '199999999999999999999',
          publicKey: 'PUBLIC_KEY',
          purchased: true,
          rated: true,
          rating: '10'
        } ]
      });

      expect(dataProduct.title).toBe('title');
      expect(dataProduct.shortDescription).toBe('shortDescription');
      expect(dataProduct.fullDescription).toBe('fullDescription');
      expect(dataProduct.category).toEqual([ 'category1' ]);
      expect(dataProduct.maxNumberOfDownloads).toBe(100);
      expect(dataProduct.price).toEqual(new BigNumber('199.999999999999999999'));
      expect(dataProduct.termsOfUseType).toBe('termsOfUseType');
      expect(dataProduct.name).toBe('name');
      expect(dataProduct.size).toBe(100);
      expect(dataProduct.ownerAddress).toBe('0x1111');
      expect(dataProduct.lastUpdate).toEqual(new Date(100));
      expect(dataProduct.daysForDeliver).toBe(1);
      expect(dataProduct.fundsToWithdraw).toEqual(new BigNumber(0));
      expect(dataProduct.transactions[ 0 ].finalised).toBeTruthy();
      expect(dataProduct.transactions[ 0 ].buyerAddress).toBe('0x11');
      expect(dataProduct.transactions[ 0 ].buyerMetaHash).toBe('BUYER_META_HASH');
      expect(dataProduct.transactions[ 0 ].price).toEqual(new BigNumber('199.999999999999999999'));
      expect(dataProduct.transactions[ 0 ].publicKey).toBe('PUBLIC_KEY');
      expect(dataProduct.transactions[ 0 ].purchased).toBeTruthy();
      expect(dataProduct.transactions[ 0 ].rated).toBeTruthy();
      expect(dataProduct.transactions[ 0 ].rating).toEqual(new BigNumber('10'));
    });
  });
});
