import { Component, OnDestroy } from '@angular/core';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';
import { Subscription } from 'rxjs/internal/Subscription';

const PENDING_FINALISATION_QUERY = {
  nested: {
    path: 'transactions',
    query: {
      bool: {
        must: [
          { match: { 'transactions.finalised': false } }
        ]
      }
    }
  }
};

@Component({
  selector: 'app-marketplace-sell-pending-finalisation',
  templateUrl: './marketplace-sell-pending-finalisation.component.html',
  styleUrls: [ './marketplace-sell-pending-finalisation.component.scss' ]
})
export class MarketplaceSellPendingFinalisationComponent implements OnDestroy {
  public displayedColumns = [
    'name',
    'title',
    'category',
    'pendingFinalisationRequests',
    'actions'
  ];
  public availableActions = [
    'finalise'
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
          PENDING_FINALISATION_QUERY
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
          PENDING_FINALISATION_QUERY
        ]
      }
    };
  }
}