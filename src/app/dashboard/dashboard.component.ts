import { Component, OnInit } from '@angular/core';

import Wallet from '../wallet';
import { WalletService } from '../wallet.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit {

  public currencyName = ` ${environment.repux.currency.defaultName} `;
  public currencyFormat: string = environment.repux.currency.format;

  wallet: Wallet;

  metaMaskStatusMessage: string;

  constructor(private walletService: WalletService) {
  }

  ngOnInit(): void {
    if (!this.walletService.isProviderAvailable()) {
      this.metaMaskStatusMessage = 'You need a secure wallet like MetaMask to browse through Marketplace. ' +
        'As soon as the extension is installed the warning will be gone.';
      return;
    }

    if (!this.walletService.isDefaultAccountAvailable()) {
      this.metaMaskStatusMessage = 'You need login to MetaMask and import RepuX account.';
      return;
    }

    this.getWallet();
  }

  getWallet(): void {
    this.walletService.getData().then(wallet => this.wallet = wallet);
  }

}
