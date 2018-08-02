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
  constructor(private web3: any, private repuxWeb3Api: RepuxWeb3Api) {
  }

  isProviderAvailable(): boolean {
    return typeof this.web3 !== 'undefined';
  }

  async isDefaultAccountAvailable(): Promise<boolean> {
    return this.isProviderAvailable() && await this.repuxWeb3Api.getDefaultAccount();
  }

  async isNetworkCorrect(): Promise<boolean> {
    if (!this.repuxWeb3Api) {
      return false;
    }

    const netId = await this.repuxWeb3Api.getNetworkId();
    return +netId >= environment.networkId;
  }

  getWeb3Instance() {
    return this.web3;
  }

  getRepuxApiInstance(): Promise<RepuxWeb3Api> {
    return this.repuxWeb3Api;
  }
}

export async function RepuxWeb3ServiceFactory(): Promise<RepuxWeb3Api> {
  const web3Provider = window.web3;
  let repuxWeb3Api;

  if (web3Provider) {
    repuxWeb3Api = new RepuxWeb3Api(web3Provider, {
      REGISTRY_CONTRACT_ADDRESS: environment.repux.registryContractAddress,
      TOKEN_CONTRACT_ADDRESS: environment.repux.tokenContractAddress
    });

    try {
      await repuxWeb3Api.init();
    } catch (err) {
      console.log(err);
      return new RepuxWeb3Service(web3Provider, undefined);
    }
  }

  return new RepuxWeb3Service(web3Provider, repuxWeb3Api);
}
