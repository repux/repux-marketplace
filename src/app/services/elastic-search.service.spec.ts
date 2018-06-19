import { ElasticSearchService } from './elastic-search.service';
import { EsDataProduct } from '../es-data-product';
import { HttpErrorResponse } from '@angular/common/http';
import { defer } from 'rxjs/index';

describe('ElasticSearchService', () => {
  let service: ElasticSearchService<EsDataProduct>;
  let httpClientSpy: { post: jasmine.Spy };
  const type = 'data_product';

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', [ 'post' ]);
    service = new ElasticSearchService(<any> httpClientSpy);
  });

  describe('#search()', () => {
    it('should return an error when API returns error', () => {
      const errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
      });

      httpClientSpy.post.and.returnValue(defer(() => Promise.reject(errorResponse)));

      service.search(type, '*', '', 10, 0, EsDataProduct)
        .subscribe(
          data => fail('expected an error, not data'),
          error => expect(error.error).toContain(errorResponse.error)
        );
    });

    it('should return EsResponse<EsDataProducts> containing 2 products', () => {
      const expectedEsDataProducts = [ {
        _index: 'repux',
        _type: type,
        _id: '1',
        _score: 2,
        _source: {
          price: '1000000000000000000'
        }
      }, {
        _index: 'repux',
        _type: type,
        _id: '2',
        _score: 1,
        _source: {
          price: '2000000000000000000'
        }
      } ];

      const expectedResult = {
        total: 2,
        max_score: 2,
        hits: expectedEsDataProducts
      };

      httpClientSpy.post.and.returnValue(defer(() => Promise.resolve({ hits: expectedResult })));

      service.search(type, '*', '', 10, 0, EsDataProduct)
        .subscribe(result => {
            expect(result.hits.length).toEqual(2, '2 products');
            expect(result.hits[ 0 ].id).toEqual('1', 'first product has id 1');
            expect(result.hits[ 0 ].source.price.toString()).toEqual('1', 'first product has price 1 REPUX');
            expect(result.hits[ 1 ].id).toEqual('2', 'second product has id 2');
            expect(result.hits[ 1 ].source.price.toString()).toEqual('2', 'first product has price 2 REPUX');
          },
          fail
        );
      expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
    });
  });
});
