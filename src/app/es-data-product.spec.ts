import { EsDataProduct } from './es-data-product';
import { BigNumber } from 'bignumber.js';

describe('EsDataProduct', () => {
  describe('#deserialize()', () => {
    it('should assign all values from input to object with some modifications', () => {
      const esDataProduct = new EsDataProduct();
      esDataProduct.deserialize({
        _index: 'repux',
        _type: 'type',
        _id: 'id',
        _score: 2,
        _source: {
          title: 'title',
          shortDescription: 'shortDescription',
          fullDescription: 'fullDescription',
          type: 'type',
          category: ['category1'],
          maxNumberOfDownloads: 100,
          price: 199,
          termsOfUseType: 'termsOfUseType',
          name: 'name',
          size: 100
        }
      });

      const dataProduct = esDataProduct.source;
      expect(esDataProduct.index).toBe('repux');
      expect(esDataProduct.type).toBe('type');
      expect(esDataProduct.id).toBe('id');
      expect(esDataProduct.score).toBe(2);
      expect(dataProduct.title).toBe('title');
      expect(dataProduct.shortDescription).toBe('shortDescription');
      expect(dataProduct.fullDescription).toBe('fullDescription');
      expect(dataProduct.category).toEqual(['category1']);
      expect(dataProduct.maxNumberOfDownloads).toBe(100);
      expect(dataProduct.price).toEqual(new BigNumber('0.000000000000000199'));
      expect(dataProduct.termsOfUseType).toBe('termsOfUseType');
      expect(dataProduct.name).toBe('name');
      expect(dataProduct.size).toBe(100);
    });
  });
});
