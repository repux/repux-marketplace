import { Component, OnDestroy } from '@angular/core';
import Wallet from '../shared/models/wallet';
import { WalletService } from '../services/wallet.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { getAwaitingFinalisationDataProductsQuery } from './services/awaiting-finalisation.service';

@Component({
  selector: 'app-marketplace-buy-awaiting-finalisation',
  templateUrl: './marketplace-buy-awaiting-finalisation.component.html',
  styleUrls: [ './marketplace-buy-awaiting-finalisation.component.scss' ]
})
export class MarketplaceBuyAwaitingFinalisationComponent implements OnDestroy {
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
    'eula',
    'actions'
  ];
  public staticQuery = {};

  private _wallet: Wallet;
  private _walletSubscription: Subscription;

  constructor(
    private _walletService: WalletService
  ) {
    this.staticQuery = getAwaitingFinalisationDataProductsQuery('');
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
    this.staticQuery = getAwaitingFinalisationDataProductsQuery(this._wallet.address);
  }
}
