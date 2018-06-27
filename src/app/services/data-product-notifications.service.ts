import { DataProductService } from './data-product.service';
import { DataProductUpdateAction, DataProductEvent } from 'repux-web3-api';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-type';
import { Notification } from '../notifications/notification';
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import Wallet from '../wallet';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class DataProductNotificationsService implements OnDestroy {
  private _purchaseSubscriptions: Subscription[] = [];
  private _wallet: Wallet;
  public finalisationRequests = [];

  constructor(
    private _notificationsService: NotificationsService,
    private _dataProductService: DataProductService,
    private _walletService: WalletService
  ) {
    this._notificationsService.addParser(
      NotificationType.DATA_PRODUCT_TO_FINALISATION,
      (notification: Notification) => this._parseDataProductToFinalisation(notification)
    );
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    this._clearSubscriptions();
    this._init();
  }

  private async _init(): Promise<void> {
    const productsAddresses = await this._dataProductService.getCreatedDataProducts();
    productsAddresses.forEach(productAddress => {
      this.watchForProductPurchase(productAddress);
    });
  }

  watchForProductPurchase(productAddress: string): void {
    this._purchaseSubscriptions.push(
      this._dataProductService.watchForDataProductUpdate(productAddress, DataProductUpdateAction.PURCHASE)
        .subscribe(purchaseEvent => this._onProductPurchase(purchaseEvent))
    );
  }

  private async _onProductPurchase(purchaseEvent: DataProductEvent): Promise<void> {
    this._notificationsService.pushNotification(new Notification(
      NotificationType.DATA_PRODUCT_TO_FINALISATION,
      {
        purchaseEvent
      })
    );
  }

  private async _parseDataProductToFinalisation(notification: Notification): Promise<string | null> {
    const purchaseEvent = notification.data.purchaseEvent;
    const transaction = await this._dataProductService.getTransactionData(purchaseEvent.dataProductAddress, purchaseEvent.userAddress);
    const notificationMessage = `User with account ${purchaseEvent.userAddress} purchased your product ` +
      `${purchaseEvent.dataProductAddress}. Please finalise this transaction.`;

    if (transaction.finalised) {
      notification.read = true;
      this._notificationsService.saveNotifications();
      return notificationMessage;
    }

    this.finalisationRequests.push({
      dataProductAddress: purchaseEvent.dataProductAddress,
      buyerAddress: purchaseEvent.userAddress
    });

    return notificationMessage;
  }

  findFinalisationRequest(_request: { dataProductAddress: string, buyerAddress: string }) {
    return this.finalisationRequests.find(request =>
      request.dataProductAddress === _request.dataProductAddress &&
      request.buyerAddress === _request.buyerAddress
    );
  }

  removeFinalisationRequest(request: { dataProductAddress: string, buyerAddress: string }) {
    const foundRequest = this.findFinalisationRequest(request);
    if (foundRequest) {
      const index = this.finalisationRequests.indexOf(foundRequest);
      this.finalisationRequests.splice(index, 1);
    }
  }

  private _clearSubscriptions() {
    if (this._purchaseSubscriptions.length) {
      this._purchaseSubscriptions.forEach(subscription => subscription.unsubscribe());
      this._purchaseSubscriptions = [];
    }
  }

  ngOnDestroy() {
    this._clearSubscriptions();
  }
}
