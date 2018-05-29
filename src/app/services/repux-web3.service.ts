import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import RepuxWeb3Api from 'repux-web3-api';

declare global {
  interface Window {
    web3: any;
  }
}

@Injectable({
  providedIn: 'root',
  useFactory: RepuxWeb3ServiceFactory
})
export class RepuxWeb3Service {
  constructor(private web3: any, private repuxWeb3Api: any) {
  }

  isProviderAvailable(): boolean {
    return typeof this.web3 !== 'undefined';
  }

  isDefaultAccountAvailable(): boolean {
    return this.isProviderAvailable() && this.repuxWeb3Api.getDefaultAccount();
  }

  getWeb3Instance() {
    return this.web3;
  }

  getRepuxApiInstance(): RepuxWeb3Api {
    return this.repuxWeb3Api;
  }
}

export function RepuxWeb3ServiceFactory() {
  const web3Provider = window.web3;
  let repuxWeb3Api;

  if (web3Provider) {
    repuxWeb3Api = new RepuxWeb3Api(web3Provider, {
      REGISTRY_CONTRACT_ADDRESS: environment.repux.registryContractAddress,
      DEMOTOKEN_CONTRACT_ADDRESS: environment.repux.demoTokenContractAddress
    });
  }

  return new RepuxWeb3Service(web3Provider, repuxWeb3Api);
}
