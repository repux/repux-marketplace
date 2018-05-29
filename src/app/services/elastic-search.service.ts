import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/index';
import { EsResponse } from '../es-response';
import { map } from 'rxjs/internal/operators';

@Injectable({
  providedIn: 'root'
})
export class ElasticSearchService<T> {
  private config = environment.repux.metaindexer;

  constructor(private http: HttpClient) {
  }

  search(type: string, query: string = '*', sort: string = '', size: number = 10,
         from: number = 0, resultEntityType: any): Observable<EsResponse<T>> {
    return this.http.get(`${this.config.protocol}://${this.config.host}:${this.config.port}/${this.config.searchUrl}` +
      `?type=${type}&q=${query}&size=${size}&from=${from}&sort=${sort}`)
      .pipe(
        map((data: { hits: EsResponse<T> }) => {
          data.hits.hits = data.hits.hits.map(hit => new resultEntityType().deserialize(hit));
          return data.hits;
        })
      );
  }
}
