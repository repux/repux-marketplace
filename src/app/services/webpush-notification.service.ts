import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Decoder } from '../shared/utils/decoder';
import { WebpushServerService } from '../services/webpush-server.service';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';

@Injectable({
  providedIn: 'root'
})
export class WebpushNotificationService {

  constructor(
    private webpushServerService: WebpushServerService,
    private walletService: WalletService
  ) {
  }

  async init() {
    if (!window.navigator) {
      return;
    }

    const registration = await window.navigator.serviceWorker.register('/service-worker.js');
    if (registration) {
      this.walletService.getWallet().subscribe(wallet => {
        if (wallet) {
          this.subscribeToNotifications(registration, wallet);
        }
      });
    }
  }

  private async subscribeToNotifications(registration: ServiceWorkerRegistration, wallet: Wallet) {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      return;
    }

    const subscriptionData = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: Decoder.urlB64ToUint8(environment.webPushServer.publicKey),
    });

    if (subscriptionData) {
      this.webpushServerService.register(wallet.address, subscriptionData).subscribe(() => {
          console.log('Subscription registered.');
        }, () => {
        });
    }
  }
}
