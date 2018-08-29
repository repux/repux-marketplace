import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';
import { Decoder } from '../shared/utils/decoder';
import { WebpushServerService } from '../services/webpush-server.service';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';
import { ClockService } from './clock.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export enum NotificationPermission {
  Default = 'default',
  Denied = 'denied',
  Granted = 'granted'
}

@Injectable({
  providedIn: 'root'
})
export class WebpushNotificationService implements OnDestroy {

  private walletSubscription: Subscription;
  private clockSubscription: Subscription;
  private notificationPermissionSubject = new BehaviorSubject<NotificationPermission>(undefined);
  private registered = false;

  constructor(
    private webpushServerService: WebpushServerService,
    private walletService: WalletService,
    private clockService: ClockService
  ) {
    this.clockSubscription = this.clockService.onEachSecond().subscribe(() => this.checkNotificationPermission());
    this.init();
  }

  getNotificationPermission(): Observable<NotificationPermission> {
    return this.notificationPermissionSubject.asObservable();
  }

  ngOnDestroy() {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }

    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }
  }

  private checkNotificationPermission() {
    const previousPermission = this.notificationPermissionSubject.getValue();
    const currentPermission = <NotificationPermission> (<any> Notification).permission;

    if (currentPermission !== previousPermission) {
      this.notificationPermissionSubject.next(currentPermission);

      if (!previousPermission) {
        return;
      }

      if (currentPermission === NotificationPermission.Granted) {
        this.init();
      }

      if (currentPermission === NotificationPermission.Default) {
        Notification.requestPermission();
      }
    }
  }

  private async init() {
    const registration = await this.getServiceWorkerRegistration();

    if (registration) {
      if (this.walletSubscription) {
        this.walletSubscription.unsubscribe();
      }

      this.walletSubscription = this.walletService.getWallet().subscribe(wallet => {
        if (wallet) {
          this.subscribeToNotifications(registration, wallet);
        }
      });
    }
  }

  private getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
    if (!window.navigator) {
      return;
    }

    if (this.registered) {
      return window.navigator.serviceWorker.ready;
    }

    return window.navigator.serviceWorker.register('/service-worker.js');
  }

  private async subscribeToNotifications(registration: ServiceWorkerRegistration, wallet: Wallet) {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      this.registerSubscription(subscription, wallet.address);
      return;
    }

    const subscriptionData = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: Decoder.urlB64ToUint8(environment.webPushServer.publicKey),
    });

    if (subscriptionData) {
      this.registerSubscription(subscriptionData, wallet.address);
    }
  }

  private registerSubscription(subscription: PushSubscription, walletAddress: string) {
    this.webpushServerService.register(walletAddress, subscription).subscribe(() => {
      console.log('Subscription registered.');
    }, () => {
    });
  }
}
