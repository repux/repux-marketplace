import { Injectable } from '@angular/core';
import { EthereumWallet } from './ethereum-wallet';

declare global {
  interface Window {
    web3: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: any;

  constructor() {
    this.web3 = window.web3;
  }

  isWeb3Present(): boolean {
    return typeof this.web3 !== 'undefined';
  }

  isCoinbaseAvailable(): boolean {
    return typeof this.web3 !== 'undefined' && this.web3.eth.coinbase;
  }

  getWallet(): Promise<EthereumWallet> {
    return new Promise<EthereumWallet>((resolve, reject) => {
      if (!this.isCoinbaseAvailable()) {
        reject('Wallet unavailable');
      }
      this.web3.eth.getBalance(this.web3.eth.coinbase, (error, result) => {
        if (!error) {
          const address = this.web3.eth.coinbase;
          const balance = this.web3.fromWei(result, 'ether');
          const ethWallet = new EthereumWallet(address, +balance.toString());
          resolve(ethWallet);
        }

        reject(error);
      });
    });
  }

  setWeb3(web3Instance: any) {
    this.web3 = web3Instance;
  }
}
