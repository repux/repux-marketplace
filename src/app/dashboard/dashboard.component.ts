import { Component, OnDestroy, OnInit } from '@angular/core';

import Wallet from '../wallet';
import { WalletService } from '../services/wallet.service';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit, OnDestroy {

  public currencyName = ` ${environment.repux.currency.defaultName} `;
  public currencyFormat: string = environment.repux.currency.format;

  wallet: Wallet;
  subscription: Subscription;

  constructor(private walletService: WalletService) {
  }

  ngOnInit(): void {
    this.subscription = this.walletService.getWallet().subscribe(wallet => this.wallet = wallet);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
