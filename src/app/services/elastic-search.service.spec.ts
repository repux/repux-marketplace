import { ElasticSearchService } from './elastic-search.service';
import { DataProduct } from '../shared/models/data-product';
import { HttpErrorResponse } from '@angular/common/http';
import { defer } from 'rxjs';
import BigNumber from 'bignumber.js';

describe('ElasticSearchService', () => {
  let service: ElasticSearchService<DataProduct>;
  let httpClientSpy: { post: jasmine.Spy };
  const type = 'data_product';

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', [ 'post' ]);
    service = new ElasticSearchService(<any> httpClientSpy, DataProduct);
  });

  describe('#search()', () => {
    it('should return an error when API returns error', () => {
      const errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
      });

      httpClientSpy.post.and.returnValue(defer(() => Promise.reject(errorResponse)));

      service.search(type, '*', '', 10, 0)
        .subscribe(
          data => fail('expected an error, not data'),
          error => expect(error.error).toContain(errorResponse.error)
        );
    });

    it('should return EsResponse<DataProducts> containing 2 products', () => {
      httpClientSpy.post.and.returnValue(defer(() => Promise.resolve({
        hits: {
          total: 2,
          max_score: 2,
          hits: [ {
            _source: {
              price: '1000000000000000000'
            }
          }, {
            _source: {
              price: '2000000000000000000'
            }
          } ]
        }
      })));

      service.search(type, '*', '', 10, 0)
        .subscribe(result => {
            expect(result.hits.length).toEqual(2, '2 products');
            expect(result.hits[ 0 ].price).toEqual(new BigNumber(1));
            expect(result.hits[ 1 ].price).toEqual(new BigNumber(2));
          },
          fail
        );
      expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
    });
  });
});
