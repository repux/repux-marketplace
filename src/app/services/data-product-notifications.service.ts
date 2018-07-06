import { DataProductService } from './data-product.service';
import { DataProductEvent, DataProductUpdateAction } from 'repux-web3-api';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-type';
import { Notification } from '../notifications/notification';
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import Wallet from '../shared/models/wallet';
import { WalletService } from './wallet.service';
import { PendingFinalisationService } from './data-product-notifications/pending-finalisation.service';
import { AwaitingFinalisationService } from './data-product-notifications/awaiting-finalisation.service';
import { ReadyToDownloadService } from './data-product-notifications/ready-to-download.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DataProductNotificationInterface } from './data-product-notifications/data-product-notification-interface';

export interface PurchaseEntry {
  dataProductAddress: string;
  buyerAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataProductNotificationsService implements OnDestroy {
  private _subscriptions: Subscription[] = [];
  private _walletSubscription: Subscription;
  private _wallet: Wallet;
  private _parsersInitialized: boolean;
  private _createdProductsAddressesSubject = new BehaviorSubject<string[]>([]);
  private _boughtProductsAddressesSubject = new BehaviorSubject<string[]>([]);
  private _parsers: DataProductNotificationInterface[];

  constructor(
    private _notificationsService: NotificationsService,
    private _dataProductService: DataProductService,
    private _walletService: WalletService,
    private _pendingFinalisationService: PendingFinalisationService,
    private _awaitingFinalisationService: AwaitingFinalisationService,
    private _readyToDownloadService: ReadyToDownloadService
  ) {
    this._parsers = [
      _pendingFinalisationService,
      _awaitingFinalisationService,
      _readyToDownloadService
    ];

    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  watchForProductPurchase(productAddress: string): void {
    this._subscriptions.push(
      this._dataProductService.watchForDataProductUpdate(productAddress, DataProductUpdateAction.PURCHASE)
        .subscribe(purchaseEvent => this._onProductPurchase(purchaseEvent))
    );
  }

  watchForAllProductPurchases(): void {
    this._subscriptions.push(
      this._dataProductService.watchForDataProductUpdate(null, DataProductUpdateAction.PURCHASE)
        .subscribe(purchaseEvent => this._onProductPurchase(purchaseEvent))
    );
  }

  watchForProductFinalise(productAddress: string): void {
    this._subscriptions.push(
      this._dataProductService.watchForDataProductUpdate(productAddress, DataProductUpdateAction.FINALISE)
        .subscribe(purchaseEvent => this._onProductFinalise(purchaseEvent))
    );
  }

  ngOnDestroy() {
    this._clearSubscriptions();

    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }
  }

  addCreatedProductAddress(productAddress) {
    const currentValue = this._createdProductsAddressesSubject.getValue();
    if (!currentValue.includes(productAddress)) {
      this._createdProductsAddressesSubject.next([ ...currentValue, productAddress ]);
      this.watchForProductPurchase(productAddress);
    }
  }

  removeCreatedProductAddress(productAddress) {
    this._createdProductsAddressesSubject.next(
      this._createdProductsAddressesSubject.getValue()
        .filter(createdProductAddress => createdProductAddress !== productAddress)
    );

    this._clearSubscriptions();
    this._initSubscriptions();
  }

  addBoughtProductAddress(productAddress) {
    const currentValue = this._boughtProductsAddressesSubject.getValue();
    if (!currentValue.includes(productAddress)) {
      this._boughtProductsAddressesSubject.next([ ...currentValue, productAddress ]);
      this.watchForProductPurchase(productAddress);
    }
  }

  removeBoughtProductAddress(productAddress) {
    this._boughtProductsAddressesSubject.next(
      this._boughtProductsAddressesSubject.getValue()
        .filter(createdProductAddress => createdProductAddress !== productAddress)
    );

    this._clearSubscriptions();
    this._initSubscriptions();
  }

  getCreatedProductsAddresses() {
    return this._createdProductsAddressesSubject.asObservable();
  }

  getBoughtProductsAddresses() {
    return this._boughtProductsAddressesSubject.asObservable();
  }

  private async _onWalletChange(wallet: Wallet): Promise<void> {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    return this._init();
  }

  private async _init(): Promise<void> {
    this._parsers.forEach(parser => {
      parser.reset();
    });

    this._createdProductsAddressesSubject.next(await this._dataProductService.getCreatedDataProducts());
    this._boughtProductsAddressesSubject.next(await this._dataProductService.getBoughtDataProducts());

    this._initParsers();
    this._clearSubscriptions();
    this._initSubscriptions();
  }

  private _onProductPurchase(purchaseEvent: DataProductEvent): Promise<void> {
    const type = this._createdProductsAddressesSubject.getValue().includes(purchaseEvent.dataProductAddress)
      ? NotificationType.DATA_PRODUCT_TO_FINALISATION
      : NotificationType.DATA_PRODUCT_PURCHASED;

    if (type === NotificationType.DATA_PRODUCT_PURCHASED &&
      purchaseEvent.userAddress !== this._wallet.address) {
      return;
    }

    this.addBoughtProductAddress(purchaseEvent.dataProductAddress);
    return this._notificationsService.pushNotification(new Notification(type, { purchaseEvent }));
  }

  private _onProductFinalise(finaliseEvent: DataProductEvent): Promise<void> {
    return this._notificationsService.pushNotification(new Notification(NotificationType.DATA_PRODUCT_FINALISED, { finaliseEvent }));
  }

  private _clearSubscriptions() {
    if (this._subscriptions.length) {
      this._subscriptions.forEach(subscription => subscription.unsubscribe());
      this._subscriptions = [];
    }
  }

  private _initSubscriptions() {
    this._createdProductsAddressesSubject.getValue().forEach(productAddress => {
      this.watchForProductPurchase(productAddress);
    });

    this._boughtProductsAddressesSubject.getValue().forEach(productAddress => {
      this.watchForProductFinalise(productAddress);
    });

    this.watchForAllProductPurchases();
  }

  private _initParsers() {
    if (!this._parsersInitialized) {

      this._parsers.forEach(async parser => {
        await this._notificationsService.addParser(
          parser.notificationType,
          (notification: Notification) => parser.parse(notification)
        );
      });

      this._parsersInitialized = true;
    }
  }
}
