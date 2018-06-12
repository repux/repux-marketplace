import { Component, OnInit } from '@angular/core';

import Wallet from '../wallet';
import { WalletService } from '../services/wallet.service';
import { environment } from '../../environments/environment';
import { VaultService } from '../vault/vault.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit {

  public currencyName = ` ${environment.repux.currency.defaultName} `;
  public currencyFormat: string = environment.repux.currency.format;

  wallet: Wallet;

  constructor(private walletService: WalletService, private vaultService: VaultService) {
  }

  ngOnInit(): void {
    this.getWallet();
  }

  getWallet(): void {
    this.walletService.getData().then(wallet => this.wallet = wallet);
  }

}
