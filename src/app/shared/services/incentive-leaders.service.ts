import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ElasticSearchService } from '../../services/elastic-search.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, of, OperatorFunction } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { DataProductListService } from '../../services/data-product-list.service';
import { environment } from '../../../environments/environment';

interface StoredData {
  updateTimestamp: number;
  sellersWithMostPopularFiles: any[];
  sellersWithHighestAverageRating: any[];
  sellersWithMostPopularFileToday: any[];
  sellersWithMostPopularFileYesterday: any[];
}

export const topRatedSellerQuery = {
  size: 0,
  aggs: {
    group_by_seller: {
      terms: {
        field: '_id',
        order: { top_seller: 'desc' },
        size: 1
      },
      aggs: {
        top_seller: {
          max: {
            field: 'sellerRating'
          }
        }
      }
    }
  }
};

export const mostPopularFileSellersQuery = {
  size: 0,
  aggs: {
    group_by_seller: {
      terms: {
        field: 'ownerAddress.keyword'
      },
      aggs: {
        group_by_file: {
          terms: {
            field: '_id',
            order: { 'orders>finalised>count': 'desc' },
            size: 1
          },
          aggs: {
            orders: {
              nested: {
                path: 'orders'
              },
              aggs: {
                finalised: {
                  filter: {
                    term: { 'orders.finalised': true }
                  },
                  aggs: {
                    count: { value_count: { 'field': '_id' } }
                  }
                }
              }
            }
          }
        },
        popularity_value: {
          max_bucket: {
            buckets_path: 'group_by_file>orders>finalised>count'
          }
        },
        sort_by_popularity: {
          bucket_sort: {
            sort: [
              { popularity_value: { order: 'desc' } }
            ],
            size: 11
          }
        }
      }
    }
  }
};

export const mostPopularFileQuery = (fromDate: string, toDate: string) => {
  return {
    size: 0,
    aggs: {
      group_by_file: {
        terms: {
          field: '_id',
          order: { 'orders>finalised>count': 'desc' },
          size: 1
        },
        aggs: {
          orders: {
            nested: {
              path: 'orders'
            },
            aggs: {
              finalised: {
                filter: {
                  bool: {
                    must: [
                      { term: { 'orders.finalised': true } },
                      { range: { 'orders.creationTimestamp': { gte: fromDate, lt: toDate } } }
                    ]
                  }
                },
                aggs: {
                  count: { value_count: { field: '_id' } }
                }
              }
            }
          }
        }
      }
    }
  };
};

@Injectable({
  providedIn: 'root'
})
export class IncentiveLeadersService {
  private static readonly STORAGE_KEY = 'IncentiveLeadersService';
  private static readonly UPDATE_INTERVAL = 60 * 60 * 1000;

  etherscanUrl = environment.etherscanUrl;

  private esService: ElasticSearchService<any>;
  private sellersWithMostPopularFilesSubject = new BehaviorSubject<any[]>(undefined);
  private sellersWithHighestAverageRatingSubject = new BehaviorSubject<any[]>(undefined);
  private sellersWithMostPopularFileTodaySubject = new BehaviorSubject<any[]>(undefined);
  private sellersWithMostPopularFileYesterdaySubject = new BehaviorSubject<any[]>(undefined);

  constructor(
    private readonly http: HttpClient,
    private readonly dataProductListService: DataProductListService,
    private readonly storageService: StorageService) {
    this.esService = new ElasticSearchService<any>(this.http, null);

    this.initialize();
  }

  getSellersWithMostPopularFiles(): Observable<any[]> {
    return this.sellersWithMostPopularFilesSubject.asObservable();
  }

  getSellersWithHighestAverageRating(): Observable<any[]> {
    return this.sellersWithHighestAverageRatingSubject.asObservable();
  }

  getSellersWithMostPopularFileTodaySubject(): Observable<any[]> {
    return this.sellersWithMostPopularFileTodaySubject.asObservable();
  }

  getSellersWithMostPopularFileYesterdaySubject(): Observable<any[]> {
    return this.sellersWithMostPopularFileYesterdaySubject.asObservable();
  }

  private fetchFilePipe(groupName: string): OperatorFunction<any, {}[]> {
    return flatMap((result: any) => {
      const buckets = result.aggregations[ groupName ].buckets;

      if (!buckets.length) {
        return of([]);
      }

      return forkJoin(buckets.map(bucket => {
        return this.dataProductListService.getDataProduct(bucket.key)
          .pipe(map(product => {
            bucket.product = {
              ownerAddress: product.ownerAddress,
              address: product.address,
              finalisedOrdersNumber: product.orders.filter(order => order.finalised).length
            };
            return bucket;
          }));
      }));
    });
  }

  private initialize() {
    const config = this.readFromStore();

    if (!config.updateTimestamp || this.getReloadTimeout(config.updateTimestamp) < 0) {
      this.fetchData();

      return;
    }

    this.sellersWithMostPopularFilesSubject.next(config.sellersWithMostPopularFiles);
    this.sellersWithHighestAverageRatingSubject.next(config.sellersWithHighestAverageRating);
    this.sellersWithMostPopularFileTodaySubject.next(config.sellersWithMostPopularFileToday);
    this.sellersWithMostPopularFileYesterdaySubject.next(config.sellersWithMostPopularFileYesterday);

    this.setTimeout(config.updateTimestamp);
  }

  private async fetchData(): Promise<void> {
    this.esService.searchRaw('user', topRatedSellerQuery)
      .subscribe(result => {
        this.sellersWithHighestAverageRatingSubject.next(result.aggregations.group_by_seller.buckets);
        this.updateStore();
      });

    this.esService.searchRaw('data_product', mostPopularFileSellersQuery)
      .pipe(this.fetchFilePipe('group_by_seller'))
      .subscribe(result => {
        this.sellersWithMostPopularFilesSubject.next(result);
        this.updateStore();
      });

    this.esService.searchRaw('data_product', mostPopularFileQuery('now-1d/d', 'now+1d/d'))
      .pipe(this.fetchFilePipe('group_by_file'))
      .subscribe(result => {
        this.sellersWithMostPopularFileTodaySubject.next(result);
        this.updateStore();
      });

    this.esService.searchRaw('data_product', mostPopularFileQuery('now-2d/d', 'now/d'))
      .pipe(this.fetchFilePipe('group_by_file'))
      .subscribe(result => {
        this.sellersWithMostPopularFileYesterdaySubject.next(result);
        this.updateStore();
      });

    this.setTimeout(IncentiveLeadersService.UPDATE_INTERVAL);
  }

  private getStorageKey(): string {
    return IncentiveLeadersService.STORAGE_KEY;
  }

  private readFromStore(): StoredData {
    const saved = this.storageService.getItem(this.getStorageKey());

    if (saved) {
      return saved;
    }
    const data = {
      updateTimestamp: undefined,
      sellersWithMostPopularFiles: undefined,
      sellersWithHighestAverageRating: undefined,
      sellersWithMostPopularFileToday: undefined,
      sellersWithMostPopularFileYesterday: undefined
    };
    this.saveToStore(data);

    return data;
  }

  private updateStore(): void {
    this.saveToStore({
      updateTimestamp: Date.now(),
      sellersWithMostPopularFiles: this.sellersWithMostPopularFilesSubject.getValue(),
      sellersWithHighestAverageRating: this.sellersWithHighestAverageRatingSubject.getValue(),
      sellersWithMostPopularFileToday: this.sellersWithMostPopularFileTodaySubject.getValue(),
      sellersWithMostPopularFileYesterday: this.sellersWithMostPopularFileYesterdaySubject.getValue()
    });
  }

  private saveToStore(data: StoredData): void {
    this.storageService.setItem(this.getStorageKey(), data);
  }

  private getReloadTimeout(updateTimestamp: number): number {
    return updateTimestamp + IncentiveLeadersService.UPDATE_INTERVAL - Date.now();
  }

  private setTimeout(milliseconds: number): void {
    setTimeout(() => this.fetchData(), this.getReloadTimeout(milliseconds));
  }
}
