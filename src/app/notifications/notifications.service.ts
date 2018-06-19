import { Injectable } from '@angular/core';
import { Notification } from './notification';
import { NotificationType } from './notification-type';
import { WalletService } from '../services/wallet.service';
import Wallet from '../wallet';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private static readonly STORAGE_PREFIX = 'NotificationsService_';
  private _config;
  private _parsers = {};
  private _storage = localStorage;
  private _wallet: Wallet;

  constructor(
    private _walletService: WalletService
  ) {
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    this._init();
  }

  addParser(type: NotificationType, parser: (notification: Notification) => Promise<string | null>): void {
    this._parsers[ type ] = parser;
    this._init();
  }

  saveNotifications(): void {
    this._setConfig(this._config);
  }

  get notifications() {
    return Object.freeze(Object.assign([], this._config.notifications));
  }

  async pushNotification(notification: Notification): Promise<void> {
    this._config.notifications.push(notification);
    await this._parseNotification(notification);
    await this.saveNotifications();
  }

  private async _parseNotification(notification: Notification): Promise<void> {
    const notificationBody = await this._parsers[ notification.type ](notification);
    if (notificationBody) {
      this._displayNotification(notificationBody);
    }
  }

  private _displayNotification(notificationBody: string): void {
    console.log('NOTIFICATION: ', notificationBody);
  }

  private _init(): void {
    if (!this._wallet) {
      return;
    }

    if (Object.keys(this._parsers).length !== Object.keys(NotificationType).length) {
      return;
    }

    this._config = this._getConfig();
    this._config.notifications.forEach((notification: Notification) => {
      this._parseNotification(notification);
    });
  }

  private _getConfig(): { notifications: Notification[] } {
    const saved = this._storage.getItem(NotificationsService.STORAGE_PREFIX + this._wallet.address);

    if (saved) {
      return JSON.parse(saved);
    }

    const config = {
      notifications: []
    };

    this._setConfig(config);

    return config;
  }

  private _setConfig(config): void {
    this._storage.setItem(NotificationsService.STORAGE_PREFIX + this._wallet.address, JSON.stringify(config));
  }
}
