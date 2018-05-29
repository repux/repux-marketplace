import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/index';
import { EsResponse } from '../es-response';
import { EsDataProduct } from '../es-data-product';
import { ElasticSearchService } from './elastic-search.service';
import { Deserializable } from '../deserializable';

@Injectable({
  providedIn: 'root'
})
export class DataProductListService {
  private static type = 'data_product';

  constructor(private esService: ElasticSearchService<EsDataProduct>) {
  }

  getFiles(query?: string, sort?: string, size?: number, from?: number): Observable<EsResponse<Deserializable<EsDataProduct>>> {
    return this.esService.search(DataProductListService.type, query, sort, size, from, EsDataProduct);
  }
}
