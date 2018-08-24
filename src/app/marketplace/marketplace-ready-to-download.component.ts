import { Component, OnDestroy } from '@angular/core';
import Wallet from '../shared/models/wallet';
import { WalletService } from '../services/wallet.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { getReadyToDownloadDataProductsQuery } from './services/ready-to-download.service';
import { ActionButtonType } from '../shared/enums/action-button-type';

@Component({
  selector: 'app-marketplace-buy-ready-to-download',
  templateUrl: './marketplace-ready-to-download.component.html',
  styleUrls: [ './marketplace-ready-to-download.component.scss' ]
})
export class MarketplaceReadyToDownloadComponent implements OnDestroy {
  public availableActions = [
    ActionButtonType.Buy,
    ActionButtonType.Rate
  ];
  public displayedColumns = [
    'details',
    'price',
    'orderDate',
    'eula',
    'actions'
  ];
  public staticQuery = {};

  private _wallet: Wallet;
  private _walletSubscription: Subscription;

  constructor(
    private _walletService: WalletService
  ) {
    this.staticQuery = getReadyToDownloadDataProductsQuery('');
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
    this.staticQuery = getReadyToDownloadDataProductsQuery(this._wallet.address);
  }
}
