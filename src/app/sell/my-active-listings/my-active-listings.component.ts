import { Component, OnDestroy } from '@angular/core';
import Wallet from '../../shared/models/wallet';
import { WalletService } from '../../services/wallet.service';
import { Subscription } from 'rxjs/internal/Subscription';

const NOT_DISABLED_OR_WITH_FUNDS_TO_WITHDRAW_QUERY = {
  bool: {
    should: [
      { match: { disabled: false } },
      {
        bool: {
          must_not: [ { match: { fundsToWithdraw: '0' } } ]
        }
      }
    ]
  }
};

@Component({
  selector: 'app-selling-files',
  templateUrl: './my-active-listings.component.html',
  styleUrls: [ './my-active-listings.component.scss' ]
})
export class MyActiveListingsComponent implements OnDestroy {
  public displayedColumns = [
    'name',
    'title',
    'category',
    'size',
    'price',
    'timesPurchased',
    'totalEarnings',
    'fundsToWithdraw',
    'pendingFinalisationRequests',
    'actions'
  ];
  public availableActions = [
    'withdraw',
    'unpublish'
  ];
  public staticQuery = {};

  private _wallet: Wallet;
  private _walletSubscription: Subscription;

  constructor(
    private _walletService: WalletService
  ) {
    this.staticQuery = {
      bool: {
        must: [
          { match: { ownerAddress: '' } },
          NOT_DISABLED_OR_WITH_FUNDS_TO_WITHDRAW_QUERY
        ]
      }
    };
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
    this.staticQuery = {
      bool: {
        must: [
          { match: { ownerAddress: this._wallet.address } },
          NOT_DISABLED_OR_WITH_FUNDS_TO_WITHDRAW_QUERY
        ]
      }
    };
  }
}
