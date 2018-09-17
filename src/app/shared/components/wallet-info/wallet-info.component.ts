import { Component, OnInit } from '@angular/core';
import Wallet from '../../models/wallet';
import { WalletService } from '../../../services/wallet.service';
import { Observable } from 'rxjs/internal/Observable';
import BigNumber from 'bignumber.js';
import { IssueDemoTokensComponent } from '../issue-demo-tokens/issue-demo-tokens.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-wallet-info',
  templateUrl: './wallet-info.component.html',
  styleUrls: [ './wallet-info.component.scss' ]
})
export class WalletInfoComponent implements OnInit {
  wallet$: Observable<Wallet>;
  balance$: Observable<BigNumber>;
  currencyPrecision = environment.repux.currency.shortPrecision;

  constructor(
    private walletService: WalletService,
    private dialog: MatDialog,
    private router: Router) {
  }

  ngOnInit(): void {
    this.wallet$ = this.walletService.getWallet();
    this.balance$ = this.walletService.getBalance();
  }

  openDemoTokensIssueDialog() {
    this.dialog.open(IssueDemoTokensComponent);
  }

  goToPromotionPage() {
    this.router.navigate([ '/incentive' ]);
  }
}
