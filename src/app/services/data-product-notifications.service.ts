import { DataProductService } from './data-product.service';
import { DataProductEvent, DataProductUpdateAction } from 'repux-web3-api';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-type';
import { Notification } from '../notifications/notification';
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import Wallet from '../shared/models/wallet';
import { WalletService } from './wallet.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class DataProductNotificationsService implements OnDestroy {
  private _finalisationRequests = [];
  private _awaitingFinalisation = [];
  private _purchaseSubscriptions: Subscription[] = [];
  private _wallet: Wallet;
  private _createdProductsAddresses: string[];
  private _boughtProductsAddresses: string[];
  private _finalisationRequestsSubject = new BehaviorSubject<string[]>([]);
  private _awaitingFinalisationSubject = new BehaviorSubject<string[]>([]);

  constructor(
    private _notificationsService: NotificationsService,
    private _dataProductService: DataProductService,
    private _walletService: WalletService
  ) {
    this._notificationsService.addParser(
      NotificationType.DATA_PRODUCT_TO_FINALISATION,
      (notification: Notification) => this._parseDataProductToFinalisation(notification)
    );
    this._notificationsService.addParser(
      NotificationType.DATA_PRODUCT_PURCHASED,
      (notification: Notification) => this._parseDataProductPurchased(notification)
    );
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  watchForProductPurchase(productAddress: string): void {
    this._purchaseSubscriptions.push(
      this._dataProductService.watchForDataProductUpdate(productAddress, DataProductUpdateAction.PURCHASE)
        .subscribe(purchaseEvent => this._onProductPurchase(purchaseEvent))
    );
  }

  findFinalisationRequest(_request: { dataProductAddress: string, buyerAddress: string }) {
    return this._finalisationRequests.find(request =>
      request.dataProductAddress === _request.dataProductAddress &&
      request.buyerAddress === _request.buyerAddress
    );
  }

  addFinalisationRequest(request: { dataProductAddress: string, buyerAddress: string }) {
    this._finalisationRequests.push(request);
    this._finalisationRequestsSubject.next(this._finalisationRequests);
  }

  removeFinalisationRequest(request: { dataProductAddress: string, buyerAddress: string }) {
    const foundRequest = this.findFinalisationRequest(request);
    if (foundRequest) {
      const index = this._finalisationRequests.indexOf(foundRequest);
      this._finalisationRequests.splice(index, 1);
      this._finalisationRequestsSubject.next(this._finalisationRequests);
    }
  }

  findAwaitingFinalisation(_request: { dataProductAddress: string, buyerAddress: string }) {
    return this._awaitingFinalisation.find(request =>
      request.dataProductAddress === _request.dataProductAddress &&
      request.buyerAddress === _request.buyerAddress
    );
  }

  addAwaitingFinalisation(request: { dataProductAddress: string, buyerAddress: string }) {
    this._awaitingFinalisation.push(request);
    this._awaitingFinalisationSubject.next(this._awaitingFinalisation);
  }

  removeAwaitingFinalisation(request: { dataProductAddress: string, buyerAddress: string }) {
    const foundRequest = this.findAwaitingFinalisation(request);
    if (foundRequest) {
      const index = this._awaitingFinalisation.indexOf(foundRequest);
      this._awaitingFinalisation.splice(index, 1);
      this._awaitingFinalisationSubject.next(this._awaitingFinalisation);
    }
  }

  getFinalisationRequests() {
    return this._finalisationRequestsSubject.asObservable();
  }

  getAwaitingFinalisation() {
    return this._awaitingFinalisationSubject.asObservable();
  }

  ngOnDestroy() {
    this._clearSubscriptions();
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    this._finalisationRequests = [];
    this._finalisationRequestsSubject.next(this._finalisationRequests);
    this._awaitingFinalisation = [];
    this._awaitingFinalisationSubject.next(this._awaitingFinalisation);
    this._clearSubscriptions();
    this._init();
  }

  private async _init(): Promise<void> {
    this._createdProductsAddresses = await this._dataProductService.getCreatedDataProducts();
    this._createdProductsAddresses.forEach(productAddress => {
      this.watchForProductPurchase(productAddress);
    });

    this._boughtProductsAddresses = await this._dataProductService.getBoughtDataProducts();
    this._boughtProductsAddresses.forEach(productAddress => {
      this.watchForProductPurchase(productAddress);
    });
  }

  private async _onProductPurchase(purchaseEvent: DataProductEvent): Promise<void> {
    if (this._createdProductsAddresses.includes(purchaseEvent.dataProductAddress)) {
      this._notificationsService.pushNotification(new Notification(
        NotificationType.DATA_PRODUCT_TO_FINALISATION,
        {
          purchaseEvent
        })
      );
    } else {
      this._notificationsService.pushNotification(new Notification(
        NotificationType.DATA_PRODUCT_PURCHASED,
        {
          purchaseEvent
        })
      );
    }
  }

  private async _parseDataProductToFinalisation(notification: Notification): Promise<string | null> {
    const purchaseEvent = notification.data.purchaseEvent;
    const transaction = await this._dataProductService.getTransactionData(purchaseEvent.dataProductAddress, purchaseEvent.userAddress);
    const notificationMessage = `User with account ${purchaseEvent.userAddress} purchased your product ` +
      `${purchaseEvent.dataProductAddress}. Please finalise this transaction.`;
    const request = {
      dataProductAddress: purchaseEvent.dataProductAddress,
      buyerAddress: purchaseEvent.userAddress
    };

    if (!transaction || transaction.finalised || this.findFinalisationRequest(request)) {
      notification.read = true;
      this._notificationsService.saveNotifications();
      return notificationMessage;
    }

    this.addFinalisationRequest(request);

    return notificationMessage;
  }

  private async _parseDataProductPurchased(notification: Notification): Promise<string | null> {
    const purchaseEvent = notification.data.purchaseEvent;
    const transaction = await this._dataProductService.getTransactionData(purchaseEvent.dataProductAddress, purchaseEvent.userAddress);
    const notificationMessage = `You have purchased product ${purchaseEvent.dataProductAddress} ` +
      `Please wait to transaction finalisation.`;
    const request = {
      dataProductAddress: purchaseEvent.dataProductAddress,
      buyerAddress: purchaseEvent.userAddress
    };

    if (!transaction || transaction.finalised || this.findAwaitingFinalisation(request)) {
      notification.read = true;
      this._notificationsService.saveNotifications();
      return notificationMessage;
    }

    this.addAwaitingFinalisation(request);

    return notificationMessage;
  }

  private _clearSubscriptions() {
    if (this._purchaseSubscriptions.length) {
      this._purchaseSubscriptions.forEach(subscription => subscription.unsubscribe());
      this._purchaseSubscriptions = [];
    }
  }
}
