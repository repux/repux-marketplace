import { Injectable } from '@angular/core';
import { ElasticSearchService } from '../../services/elastic-search.service';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private static type = 'user';
  private esService: ElasticSearchService<User>;

  constructor(
    private http: HttpClient) {
    this.esService = new ElasticSearchService<User>(http, User);
  }

  getUser(address: string): Observable<User> {
    const query = {
      bool: {
        must: [
          { match: { address } }
        ]
      }
    };

    return this.esService.search(UserService.type, query, {}, 1, 0).pipe(
      pluck('hits'),
      map(obj => obj[ 0 ])
    );
  }
}
