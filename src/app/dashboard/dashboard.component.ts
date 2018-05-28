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



  constructor(private walletService: WalletService) {
  }

  ngOnInit(): void {
    this.getWallet();
  }

  getWallet(): void {
    this.walletService.getData().then(wallet => this.wallet = wallet);
  }

}
