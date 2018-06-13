import { Injectable } from '@angular/core';
import { Notification } from './notification';
import { NotificationType } from './notification-type';
import { WalletService } from '../services/wallet.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private static readonly STORAGE_PREFIX = 'NotificationsService_';
  private _config;
  private _parsers = {};
  private _storage = localStorage;

  constructor(
    private _walletService: WalletService
  ) {}

  addParser(type: NotificationType, parser: (notification: Notification) => Promise<string|null>): Promise<void> {
    this._parsers[type] = parser;

    if (Object.keys(this._parsers).length === Object.keys(NotificationType).length) {
      return this._init();
    }
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
    const notificationBody = await this._parsers[notification.type](notification);
    if (notificationBody) {
      this._displayNotification(notificationBody);
    }
  }

  private _displayNotification(notificationBody: string): void {
    console.log('NOTIFICATION: ', notificationBody);
  }

  private async _init(): Promise<void> {
    this._config = await this._getConfig();
    this._config.notifications.forEach((notification: Notification) => {
      this._parseNotification(notification);
    });
  }

  private async _getConfig(): Promise<{ notifications: Notification[] }> {
    const saved = this._storage.getItem(NotificationsService.STORAGE_PREFIX + 'config');
    const wallet = await this._walletService.getData();

    if (saved) {
      const parsed = JSON.parse(saved);

      if (parsed.address === wallet.address) {
        return parsed;
      }
    }

    const config = {
      notifications: [],
      address: wallet.address
    };

    await this._setConfig(config);

    return config;
  }

  private async _setConfig(config): Promise<void> {
    const wallet = await this._walletService.getData();
    config.address = wallet.address;
    this._storage.setItem(NotificationsService.STORAGE_PREFIX + 'config', JSON.stringify(config));
  }
}
