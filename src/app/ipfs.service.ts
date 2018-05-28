import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

declare global {
  interface Window {
    IpfsApi: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class IpfsService {
  private ipfs;

  constructor() {
    this.ipfs = new window.IpfsApi(environment.ipfs);
  }

  getInstance(): any {
    return this.ipfs;
  }
}
