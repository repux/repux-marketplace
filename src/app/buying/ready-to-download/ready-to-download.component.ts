import { Component } from '@angular/core';
import Wallet from '../../shared/models/wallet';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-ready-to-download',
  templateUrl: './ready-to-download.component.html',
  styleUrls: [ './ready-to-download.component.scss' ]
})
export class ReadyToDownloadComponent {
  public availableActions = [
    'buy'
  ];
  public staticQuery = {};

  private _wallet: Wallet;

  constructor(
    private _walletService: WalletService
  ) {
    this.staticQuery = this._getStaticQuery('');
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    this.staticQuery = this._getStaticQuery(this._wallet.address);
  }

  private _getStaticQuery(walletAddress: string) {
    return {
      bool: {
        must: [
          {
            nested: {
              path: 'transactions',
              query: {
                bool: {
                  must: [
                    { match: { 'transactions.buyerAddress': walletAddress } },
                    { match: { 'transactions.finalised': true } }
                  ]
                }
              }
            }
          }
        ]
      }
    };
  }
}
