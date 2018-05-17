import { Component, Input, OnInit } from '@angular/core';
import {Web3Service } from '../web3.service';
import { EthereumWallet } from '../ethereum-wallet';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit {
  wallet: EthereumWallet;

  metaMaskStatusMessage: string;

  constructor(private web3Service: Web3Service) {
  }

  ngOnInit(): void {
    if (!this.web3Service.isWeb3Present()) {
      this.metaMaskStatusMessage = 'You need a secure wallet like MetaMask to browse through Marketplace. ' +
        'As soon as the extension is installed the warning will be gone.';
      return;
    }

    if (!this.web3Service.isCoinbaseAvailable()) {
      this.metaMaskStatusMessage = 'You need login to MetaMask and import RepuX account.';
      return;
    }

    this.getWallet();
  }

  getWallet(): void {
    this.web3Service.getWallet().then(wallet => this.wallet = wallet);
  }

}
