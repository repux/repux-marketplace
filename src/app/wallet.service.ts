import { Injectable } from '@angular/core';
import Wallet from './wallet';
import { environment } from '../environments/environment';
import RepuxWeb3Api from 'repux-web3-api';

declare global {
  interface Window {
    web3: any;
  }
}

export function WalletServiceFactory() {
  const web3Provider = window.web3;
  let repuxWeb3Api;

  if (web3Provider) {
    repuxWeb3Api = new RepuxWeb3Api(web3Provider, {
      REGISTRY_CONTRACT_ADDRESS: environment.repux.registryContractAddress,
      DEMOTOKEN_CONTRACT_ADDRESS: environment.repux.demoTokenContractAddress
    });
  }

  return new WalletService(web3Provider, repuxWeb3Api);
}

@Injectable({
  providedIn: 'root',
  useFactory: WalletServiceFactory
})
export class WalletService {
  constructor(private web3: any, private repuxWeb3Api: any) {
  }

  isProviderAvailable(): boolean {
    return typeof this.web3 !== 'undefined';
  }

  isDefaultAccountAvailable(): boolean {
    return typeof this.web3 !== 'undefined' && this.web3.eth.accounts[ 0 ];
  }

  async getData(): Promise<Wallet> {
    if (!this.isDefaultAccountAvailable()) {
      return null;
    }

    const defaultAccount = this.repuxWeb3Api.getDefaultAccount();
    const accountBalanceInWei = await this.repuxWeb3Api.getBalance();
    const accountBalanceInEther = this.web3.fromWei(accountBalanceInWei, 'ether');

    return new Wallet(defaultAccount, +accountBalanceInEther.toString());
  }
}
