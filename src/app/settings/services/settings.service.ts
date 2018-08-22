import { StorageService } from '../../services/storage.service';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Injectable, OnDestroy } from '@angular/core';

export interface Settings {
  daysToDeliver: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements OnDestroy {
  public static readonly STORAGE_KEY = 'SettingService';
  public static readonly DEFAULT_SETTINGS = {
    daysToDeliver: environment.repux.defaultDaysToDeliver
  } as Settings;

  private wallet: Wallet;
  private walletSubscription: Subscription;
  private settingsSubject = new BehaviorSubject<Settings>(SettingsService.DEFAULT_SETTINGS);

  constructor(
    private walletService: WalletService,
    private storageService: StorageService
  ) {
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
  }

  get daysToDeliver(): number {
    const data = this.readFromStore();
    if (data) {
      return this.readFromStore().daysToDeliver;
    }

    return environment.repux.defaultDaysToDeliver;
  }

  set daysToDeliver(value: number) {
    this.setValueToStore('daysToDeliver', value);
  }

  get daysToDeliverOptions(): number[] {
    return Array.from(Array(environment.repux.maxDaysToDeliver + 1).keys());
  }

  getSettings(): Observable<Settings> {
    return this.settingsSubject.asObservable();
  }

  ngOnDestroy() {
    this.walletSubscription.unsubscribe();
  }

  private onWalletChange(wallet: Wallet): void {
    if (!wallet) {
      return;
    }

    this.wallet = wallet;
    this.settingsSubject.next(this.readFromStore());
  }

  private getStorageKey(): string {
    if (!this.wallet) {
      return;
    }

    return SettingsService.STORAGE_KEY + '_' + this.wallet.address;
  }

  private setValueToStore(key: string, value: any): void {
    const settings = this.readFromStore();
    settings[ key ] = value;
    this.saveToStore(settings);
  }

  private readFromStore(): any {
    const storageKey = this.getStorageKey();

    if (!storageKey) {
      return;
    }

    const saved = this.storageService.getItem(this.getStorageKey());

    if (saved) {
      return saved;
    }

    const data = Object.assign({}, SettingsService.DEFAULT_SETTINGS);
    this.saveToStore(data);

    return data;
  }

  private saveToStore(data: any): void {
    this.storageService.setItem(this.getStorageKey(), data);
    this.settingsSubject.next(data);
  }
}
