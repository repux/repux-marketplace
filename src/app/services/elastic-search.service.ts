import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { EsResponse } from '../shared/models/es-response';
import { map } from 'rxjs/internal/operators';
import { Deserializable } from '../shared/models/deserializable';

export class ElasticSearchService<T extends Deserializable<T>> {
  private config = environment.repux.metaindexer;

  constructor(private http: HttpClient, private recordType: new () => T) {
  }

  search(type: string, query: Object = { bool: {} }, sort: Object = {}, size: number = 10,
         from: number = 0): Observable<EsResponse<T>> {
    return this.http.post(`${this.config.protocol}://${this.config.host}:${this.config.port}/${type}/_search` +
      `?size=${size}&from=${from}`, { query, sort }).pipe(
      map((data: { hits: EsResponse<any> }) => {
        data.hits.hits = data.hits.hits.map(hit => new this.recordType().deserialize(hit._source));
        return data.hits;
      })
    );
  }

  searchRaw(type: string, data: any = {}): Observable<any> {
    return this.http.post(`${this.config.protocol}://${this.config.host}:${this.config.port}/${type}/_search`, data);
  }
}
