import { Component, OnDestroy } from '@angular/core';
import Wallet from '../shared/models/wallet';
import { WalletService } from '../services/wallet.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { getCreatedDataProductsQuery } from './services/my-active-listings.service';
import { ActionButtonType } from '../shared/enums/action-button-type';

@Component({
  selector: 'app-marketplace-sell-my-active-listings',
  templateUrl: './marketplace-active-listings.component.html',
  styleUrls: [ './marketplace-active-listings.component.scss' ]
})
export class MarketplaceActiveListingsComponent implements OnDestroy {
  public displayedColumns = [
    'title',
    'price',
    'timesPurchased',
    'totalEarnings',
    'fundsToWithdraw',
    'pendingFinalisationRequests',
    'eula',
    'actions'
  ];
  public availableActions = [
    ActionButtonType.Withdraw,
    ActionButtonType.Unpublish
  ];
  public staticQuery = {};

  private _wallet: Wallet;
  private _walletSubscription: Subscription;

  constructor(
    private _walletService: WalletService
  ) {
    this.staticQuery = getCreatedDataProductsQuery('');
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
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
    this.staticQuery = getCreatedDataProductsQuery(this._wallet.address);
  }
}
