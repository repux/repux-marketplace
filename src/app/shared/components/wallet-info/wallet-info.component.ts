import { Component, OnInit } from '@angular/core';
import Wallet from '../../models/wallet';
import { WalletService } from '../../../services/wallet.service';
import { Observable } from 'rxjs/internal/Observable';
import BigNumber from 'bignumber.js';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-wallet-info',
  templateUrl: './wallet-info.component.html',
  styleUrls: [ './wallet-info.component.scss' ]
})
export class WalletInfoComponent implements OnInit {
  wallet$: Observable<Wallet>;
  balance$: Observable<{ repux: BigNumber, eth: BigNumber }>;
  currencyPrecision = environment.repux.currency.shortPrecision;

  constructor(
    private walletService: WalletService) {
  }

  ngOnInit(): void {
    this.wallet$ = this.walletService.getWallet();
    this.balance$ = this.walletService.getBalance();
  }
}
