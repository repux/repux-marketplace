import { DataProductListService } from './data-product-list.service';
import { defer, from } from 'rxjs/index';
import { EsDataProduct } from '../shared/models/es-data-product';

describe('DataProductListService', () => {
  let elasticSearchServiceSpy: { search: jasmine.Spy };
  let dataProductServiceSpy: { getDataProductData: jasmine.Spy };
  let service: DataProductListService;
  const type = 'data_product';

  beforeEach(() => {
    elasticSearchServiceSpy = jasmine.createSpyObj('ElasticSearchService', [ 'search' ]);
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'getDataProductData' ]);

    service = new DataProductListService(<any> elasticSearchServiceSpy, <any> dataProductServiceSpy);
  });

  describe('#getDataProducts()', () => {
    it('should call search method on ElasticSearchService', () => {
      const expectedEsDataProducts = [ new EsDataProduct().deserialize({
        _index: 'repux',
        _type: type,
        _id: '1',
        _score: 2,
        _source: {
          price: 1
        }
      }), new EsDataProduct().deserialize({
        _index: 'repux',
        _type: type,
        _id: '2',
        _score: 1,
        _source: {
          price: 2
        }
      }) ];

      const expectedResult = {
        total: 2,
        max_score: 2,
        hits: expectedEsDataProducts
      };

      elasticSearchServiceSpy.search.and.returnValue(defer(() => Promise.resolve(expectedResult)));

      service.getDataProducts()
        .subscribe(result => {
            expect(result).toEqual(expectedResult, 'expected result');
          },
          fail
        );
      expect(elasticSearchServiceSpy.search.calls.count()).toBe(1, 'one call');
    });
  });

  describe('#getDataProductsWithBlockchainState()', () => {
    it('should call search method on ElasticSearchService and get state from blockchain for all products', () => {
      const expectedEsDataProducts = [ new EsDataProduct().deserialize({
        _index: 'repux',
        _type: type,
        _id: '1',
        _score: 2,
        _source: {
          address: '1',
          price: 1
        }
      }), new EsDataProduct().deserialize({
        _index: 'repux',
        _type: type,
        _id: '2',
        _score: 1,
        _source: {
          address: '2',
          price: 2
        }
      }) ];

      const expectedResult = {
        total: 2,
        max_score: 2,
        hits: expectedEsDataProducts
      };

      elasticSearchServiceSpy.search.and.returnValue(from(Promise.resolve(expectedResult)));
      dataProductServiceSpy.getDataProductData.and.callFake(productAddress =>
        Promise.resolve({ disabled: true, address: productAddress })
      );

      service.getDataProductsWithBlockchainState()
        .subscribe(result => {
            expect(result).toEqual(expectedResult, 'expected result');
            expect(expectedResult.hits[ 0 ].source.blockchainState.disabled).toBe(true);
            expect(expectedResult.hits[ 0 ].source.blockchainState.address).toBe('1');
            expect(expectedResult.hits[ 1 ].source.blockchainState.disabled).toBe(true);
            expect(expectedResult.hits[ 1 ].source.blockchainState.address).toBe('2');
            expect(dataProductServiceSpy.getDataProductData.calls.count()).toBe(2);
          },
          fail
        );
      expect(elasticSearchServiceSpy.search.calls.count()).toBe(1, 'one call');
    });
  });
});
