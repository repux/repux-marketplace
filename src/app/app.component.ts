import { Component, OnInit } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { DataProductNotificationsService } from './services/data-product-notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
  navLinks = [
    {
      label: 'Dashboard',
      path: 'dashboard'
    },
    {
      label: 'Marketplace',
      path: 'marketplace'
    }
  ];

  metaMaskStatusMessage: string;

  constructor(
    private walletService: WalletService,
    private _dataProductNotificationService: DataProductNotificationsService) {
  }

  async ngOnInit(): Promise<void> {
    if (!this.walletService.isProviderAvailable()) {
      this.metaMaskStatusMessage = 'You need a secure wallet like MetaMask to browse through Marketplace. ' +
        'As soon as the extension is installed the warning will be gone.';
      return;
    }

    if (!await this.walletService.isDefaultAccountAvailable()) {
      this.metaMaskStatusMessage = 'You need login to MetaMask and import RepuX account.';
      return;
    }
  }
}
