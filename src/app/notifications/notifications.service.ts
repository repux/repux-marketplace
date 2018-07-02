import { Injectable } from '@angular/core';
import { Notification } from './notification';
import { NotificationType } from './notification-type';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private static readonly STORAGE_PREFIX = 'NotificationsService_';
  private readonly _defaultData = {
    notifications: []
  };
  private _config;
  private _parsers = {};
  private _storage = localStorage;
  private _wallet: Wallet;

  constructor(
    private _walletService: WalletService,
    private _storageService: StorageService
  ) {
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  get notifications() {
    return Object.freeze(Object.assign([], this._config.notifications));
  }

  addParser(type: NotificationType, parser: (notification: Notification) => Promise<string | null>): void {
    this._parsers[ type ] = parser;
    this._init();
  }

  saveNotifications(): void {
    this._saveToStore(this._config);
  }

  async pushNotification(notification: Notification): Promise<void> {
    this._config.notifications.push(notification);
    await this._parseNotification(notification);
    await this.saveNotifications();
  }

  private _readFromStore(): any {
    const saved = this._storageService.getItem(this._getStorageKey());

    if (saved) {
      return saved;
    }

    this._saveToStore(this._defaultData);
    return this._defaultData;
  }

  private _saveToStore(data: any): void {
    this._storageService.setItem(this._getStorageKey(), data);
  }

  private _getStorageKey(): string {
    return NotificationsService.STORAGE_PREFIX + this._wallet.address;
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    this._init();
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

    this._config = this._readFromStore();
    this._config.notifications.forEach((notification: Notification) => {
      this._parseNotification(notification);
    });
  }
}
