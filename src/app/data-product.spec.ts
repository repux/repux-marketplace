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
        category: ['category1'],
        maxNumberOfDownloads: 100,
        price: '199.999999999999999999',
        termsOfUseType: 'termsOfUseType',
        name: 'name',
        size: 100
      });

      expect(dataProduct.title).toBe('title');
      expect(dataProduct.shortDescription).toBe('shortDescription');
      expect(dataProduct.fullDescription).toBe('fullDescription');
      expect(dataProduct.category).toEqual(['category1']);
      expect(dataProduct.maxNumberOfDownloads).toBe(100);
      expect(dataProduct.price).toEqual(new BigNumber('199.999999999999999999'));
      expect(dataProduct.termsOfUseType).toBe('termsOfUseType');
      expect(dataProduct.name).toBe('name');
      expect(dataProduct.size).toBe(100);
    });
  });
});
