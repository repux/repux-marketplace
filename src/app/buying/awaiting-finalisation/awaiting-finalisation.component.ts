import { Component, OnDestroy } from '@angular/core';
import Wallet from '../../shared/models/wallet';
import { WalletService } from '../../services/wallet.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-awaiting-finalisation',
  templateUrl: './awaiting-finalisation.component.html',
  styleUrls: [ './awaiting-finalisation.component.scss' ]
})
export class AwaitingFinalisationComponent implements OnDestroy {
  public availableActions = [
    'cancelPurchase'
  ];
  public displayedColumns = [
    'name',
    'title',
    'category',
    'price',
    'transactionDate',
    'daysForDeliver',
    'deliveryDeadline',
    'actions'
  ];
  public staticQuery = {};

  private _wallet: Wallet;
  private _walletSubscription: Subscription;

  constructor(
    private _walletService: WalletService
  ) {
    this.staticQuery = this._getStaticQuery('');
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  get buyerAddress() {
    if (!this._wallet) {
      return;
    }

    return this._wallet.address;
  }

  ngOnDestroy() {
    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }
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
                    { match: { 'transactions.finalised': false } }
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
