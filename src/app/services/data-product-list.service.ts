import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/index';
import { EsResponse } from '../shared/models/es-response';
import { EsDataProduct } from '../shared/models/es-data-product';
import { ElasticSearchService } from './elastic-search.service';
import { Deserializable } from '../shared/models/deserializable';

@Injectable({
  providedIn: 'root'
})
export class DataProductListService {
  private static type = 'data_product';

  constructor(private esService: ElasticSearchService<EsDataProduct>) {
  }

  getFiles(query?: Object, sort?: string, size?: number, from?: number): Observable<EsResponse<Deserializable<EsDataProduct>>> {
    return this.esService.search(DataProductListService.type, query, sort, size, from, EsDataProduct);
  }
}
