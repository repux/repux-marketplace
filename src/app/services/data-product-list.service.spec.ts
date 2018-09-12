import { DataProductListService } from './data-product-list.service';
import { defer } from 'rxjs';
import { DataProduct } from '../shared/models/data-product';
import BigNumber from 'bignumber.js';

describe('DataProductListService', () => {
  let httpSpy: { post: jasmine.Spy };
  let service: DataProductListService;
  const type = 'data_product';

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', [ 'post' ]);

    service = new DataProductListService(<any> httpSpy);
  });

  describe('#getDataProducts()', () => {
    it('should call search method on ElasticSearchService', () => {
      const lastUpdateTimestamp = 1532695485;
      const creationTimestamp = 1532695485;
      const fundsToWithdraw = '0';
      const price = '0';

      const expectedDataProducts = [ new DataProduct().deserialize({
        price: new BigNumber(price),
        lastUpdate: new Date(lastUpdateTimestamp),
        lastUpdateTimestamp,
        creationTimestamp,
        fundsToWithdraw: new BigNumber(fundsToWithdraw),
      }), new DataProduct().deserialize({
        price: new BigNumber(price),
        lastUpdate: new Date(lastUpdateTimestamp),
        lastUpdateTimestamp,
        creationTimestamp,
        fundsToWithdraw: new BigNumber(fundsToWithdraw),
      }) ];

      const expectedResult = {
        total: 2,
        max_score: 2,
        hits: expectedDataProducts
      };

      httpSpy.post.and.returnValue(defer(() => Promise.resolve({
        hits: {
          total: 2,
          max_score: 2,
          hits: [ {
            _index: 'repux',
            _type: type,
            _id: '1',
            _score: 2,
            _source: {
              price,
              lastUpdateTimestamp,
              creationTimestamp,
              fundsToWithdraw
            }
          }, {
            _index: 'repux',
            _type: type,
            _id: '2',
            _score: 1,
            _source: {
              price,
              lastUpdateTimestamp,
              creationTimestamp,
              fundsToWithdraw
            }
          } ]
        }
      })));

      service.getDataProducts()
        .subscribe(result => {
            expect(result).toEqual(expectedResult, 'expected result');
          },
          fail
        );
      expect(httpSpy.post.calls.count()).toBe(1, 'one call');
    });
  });
});
