import { DataProductListService } from './data-product-list.service';
import { defer, from } from 'rxjs';
import { DataProduct } from '../shared/models/data-product';
import BigNumber from 'bignumber.js';

describe('DataProductListService', () => {
  let httpSpy: { post: jasmine.Spy };
  let dataProductServiceSpy: { getDataProductData: jasmine.Spy };
  let service: DataProductListService;
  const type = 'data_product';

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', [ 'post' ]);
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'getDataProductData' ]);

    service = new DataProductListService(<any> httpSpy, <any> dataProductServiceSpy);
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

  describe('#getDataProductsWithBlockchainState()', () => {
    it('should call search method on ElasticSearchService and get state from blockchain for all products', () => {
      const lastUpdateTimestamp = 1532695485;
      const creationTimestamp = 1532695485;
      const fundsToWithdraw = '0';
      const price = '0';

      const expectedDataProducts = [ new DataProduct().deserialize({
        address: '1',
        price: new BigNumber(price),
        lastUpdate: new Date(lastUpdateTimestamp),
        lastUpdateTimestamp,
        fundsToWithdraw: new BigNumber(fundsToWithdraw),
      }), new DataProduct().deserialize({
        address: '2',
        price: new BigNumber(price),
        lastUpdate: new Date(lastUpdateTimestamp),
        lastUpdateTimestamp,
        fundsToWithdraw: new BigNumber(fundsToWithdraw),
      }) ];

      const expectedResult = {
        total: 2,
        max_score: 2,
        hits: expectedDataProducts
      };

      httpSpy.post.and.returnValue(from(Promise.resolve({
        hits: {
          total: 2,
          max_score: 2,
          hits: [ {
            _index: 'repux',
            _type: type,
            _id: '1',
            _score: 2,
            _source: {
              address: '1',
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
              address: '2',
              price,
              lastUpdateTimestamp,
              creationTimestamp,
              fundsToWithdraw
            }
          } ]
        }
      })));
      dataProductServiceSpy.getDataProductData.and.callFake(productAddress =>
        Promise.resolve({ disabled: true, address: productAddress })
      );

      service.getDataProductsWithBlockchainState()
        .subscribe(result => {
            expect(result.hits[ 0 ].blockchainState.disabled).toBe(true);
            expect(result.hits[ 0 ].blockchainState.address).toBe('1');
            expect(result.hits[ 1 ].blockchainState.disabled).toBe(true);
            expect(result.hits[ 1 ].blockchainState.address).toBe('2');
            expect(dataProductServiceSpy.getDataProductData.calls.count()).toBe(2);
          },
          fail
        );
      expect(httpSpy.post.calls.count()).toBe(1, 'one call');
    });
  });
});
