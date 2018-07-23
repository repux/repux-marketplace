import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/index';
import { EsResponse } from '../shared/models/es-response';
import { EsDataProduct } from '../shared/models/es-data-product';
import { ElasticSearchService } from './elastic-search.service';
import { Deserializable } from '../shared/models/deserializable';
import { flatMap } from 'rxjs/internal/operators';
import { DataProductService } from './data-product.service';

@Injectable({
  providedIn: 'root'
})
export class DataProductListService {
  private static type = 'data_product';

  constructor(
    private esService: ElasticSearchService<EsDataProduct>,
    private dataProductService: DataProductService) {
  }

  getDataProducts(query?: Object, sort?: string, size?: number, from?: number): Observable<EsResponse<Deserializable<EsDataProduct>>> {
    return this.esService.search(DataProductListService.type, query, sort, size, from, EsDataProduct);
  }

  getDataProductsWithBlockchainState(query?: Object, sort?: string, size?: number, from?: number)
    : Observable<EsResponse<Deserializable<EsDataProduct>>> {
    return this.getDataProducts(query, sort, size, from)
      .pipe(
        flatMap(async esDataProducts => {
          const dataProducts = esDataProducts.hits.map((esDataProduct: EsDataProduct) => esDataProduct.source);

          await Promise.all(dataProducts.map(dataProduct => {
            const promise = this.dataProductService.getDataProductData(dataProduct.address);
            promise.then(blockchainState => dataProduct.blockchainState = blockchainState);

            return promise;
          }));

          return esDataProducts;
        })
      );
  }

  getDataProduct(address: string): Observable<EsResponse<Deserializable<EsDataProduct>>> {
    const query = {
      'bool': {
        'must': [
          { 'match': { 'address': address } }
        ]
      }
    };
    return this.esService.search(DataProductListService.type, query, '', 1, 0, EsDataProduct);
  }
}
