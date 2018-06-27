import { Component } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../wallet';

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
  selector: 'app-awaiting-files',
  templateUrl: './pending-finalisation.component.html',
  styleUrls: [ './pending-finalisation.component.scss' ]
})
export class PendingFinalisationComponent {
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
  private _wallet: Wallet;
  public staticQuery = {};

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
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
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
