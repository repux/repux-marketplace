import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EsResponse } from '../shared/models/es-response';
import { ElasticSearchService } from './elastic-search.service';
import { flatMap, map, pluck } from 'rxjs/internal/operators';
import { DataProductService } from './data-product.service';
import { DataProduct } from '../shared/models/data-product';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataProductListService {
  private static type = 'data_product';
  private esService: ElasticSearchService<DataProduct>;

  constructor(
    private http: HttpClient,
    private dataProductService: DataProductService) {
    this.esService = new ElasticSearchService(this.http, DataProduct);
  }

  getDataProducts(query?: Object, sort?: string, size?: number, from?: number): Observable<EsResponse<DataProduct>> {
    return this.esService.search(DataProductListService.type, query, sort, size, from);
  }

  getDataProductsWithBlockchainState(query?: Object, sort?: string, size?: number, from?: number)
    : Observable<EsResponse<DataProduct>> {
    return this.getDataProducts(query, sort, size, from)
      .pipe(
        flatMap(async esResponse => {
          await Promise.all(esResponse.hits.map(dataProduct => {
            const promise = this.dataProductService.getDataProductData(dataProduct.address);
            promise.then(blockchainState => dataProduct.blockchainState = blockchainState);

            return promise;
          }));

          return esResponse;
        })
      );
  }

  getDataProduct(address: string): Observable<DataProduct> {
    const query = {
      'bool': {
        'must': [
          { 'match': { 'address': address } }
        ]
      }
    };
    return this.esService.search(DataProductListService.type, query, '', 1, 0).pipe(
      pluck('hits'),
      map(obj => obj[ 0 ])
    );
  }
}
