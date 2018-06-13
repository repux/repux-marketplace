import { Injectable } from '@angular/core';
import Wallet from '../wallet';
import { RepuxWeb3Service } from './repux-web3.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  constructor(private repuxWeb3Service: RepuxWeb3Service) {
  }

  isProviderAvailable(): boolean {
    return this.repuxWeb3Service.isProviderAvailable();
  }

  isDefaultAccountAvailable(): Promise<boolean> {
    return this.repuxWeb3Service.isDefaultAccountAvailable();
  }

  async getData(): Promise<Wallet> {
    if (!await this.isDefaultAccountAvailable()) {
      return null;
    }

    const defaultAccount = await this.repuxWeb3Service.getRepuxApiInstance().getDefaultAccount();
    const accountBalanceInWei = await this.repuxWeb3Service.getRepuxApiInstance().getBalance();
    const accountBalanceInEther = this.repuxWeb3Service.getWeb3Instance().fromWei(accountBalanceInWei, 'ether');

    return new Wallet(defaultAccount, +accountBalanceInEther.toString());
  }
}
