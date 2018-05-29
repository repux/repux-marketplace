import { Injectable } from '@angular/core';
import { RepuxWeb3Service } from './repux-web3.service';
import BigNumber from 'bignumber.js';

@Injectable({
  providedIn: 'root'
})
export class DataProductService {
  constructor(private repuxWeb3Service: RepuxWeb3Service) {
  }

  publishDataProduct(metaFileHash: string, price: BigNumber): Promise<any> {
    if (!this.repuxWeb3Service.isDefaultAccountAvailable()) {
      return Promise.reject(null);
    }

    return this.repuxWeb3Service.getRepuxApiInstance().createDataProduct(metaFileHash, price);
  }
}
