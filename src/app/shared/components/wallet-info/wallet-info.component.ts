import { Component, OnInit } from '@angular/core';
import Wallet from '../../models/wallet';
import { WalletService } from '../../../services/wallet.service';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-wallet-info',
  templateUrl: './wallet-info.component.html',
  styleUrls: ['./wallet-info.component.scss']
})
export class WalletInfoComponent implements OnInit {
  wallet$: Observable<Wallet>;

  constructor(private walletService: WalletService) {
  }

  ngOnInit(): void {
    this.wallet$ = this.walletService.getWallet();
  }
}
