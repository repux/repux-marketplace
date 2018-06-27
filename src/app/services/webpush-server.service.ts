import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebpushServerService {
  private url: string;

  constructor(private http: HttpClient) {
    this.url = environment.webPushServer.host;
  }

  register(address: string, subscription) {
    return this.http.post(this.url + '/register', { address, subscription });
  }

  ping() {
    return this.http.get(this.url);
  }
}
