import { DataProductListService } from './data-product-list.service';
import { defer } from 'rxjs/index';
import { EsDataProduct } from '../es-data-product';

describe('DataProductListService', () => {
  let elasticSearchServiceSpy: { search: jasmine.Spy };
  let service: DataProductListService;
  const type = 'data_product';

  beforeEach(() => {
     elasticSearchServiceSpy = jasmine.createSpyObj('ElasticSearchService', [ 'search' ]);
     service = new DataProductListService(<any> elasticSearchServiceSpy);
  });

  describe('#getFiles()', () => {
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

        service.getFiles()
          .subscribe(result => {
              expect(result).toEqual(expectedResult, 'expected result');
            },
            fail
          );
        expect(elasticSearchServiceSpy.search.calls.count()).toBe(1, 'one call');
      });
  });
});
