import { NotificationType } from '../../notifications/notification-type';
import { Notification } from '../../notifications/notification';
import { DataProductService } from '../data-product.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PurchaseEntry } from '../data-product-notifications.service';
import { Injectable } from '@angular/core';
import { DataProductNotificationBase } from './data-product-notification-base';
import { DataProductNotificationInterface } from './data-product-notification-interface';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class PendingFinalisationService implements DataProductNotificationInterface {
  public readonly notificationType: NotificationType = NotificationType.DATA_PRODUCT_TO_FINALISATION;
  private _dataProductNotificationBase = new DataProductNotificationBase();

  constructor(
    private _dataProductService: DataProductService,
    private _notificationsService: NotificationsService
  ) {
  }

  find(purchaseEntry: PurchaseEntry): PurchaseEntry {
    return this._dataProductNotificationBase.find(purchaseEntry);
  }

  add(purchaseEntry: PurchaseEntry): void {
    return this._dataProductNotificationBase.add(purchaseEntry);
  }

  remove(purchaseEntry: PurchaseEntry): void {
    return this._dataProductNotificationBase.remove(purchaseEntry);
  }

  async parse(notification: Notification): Promise<string> {
    const purchaseEvent = notification.data.purchaseEvent;
    const transaction = await this._dataProductService.getTransactionData(purchaseEvent.dataProductAddress, purchaseEvent.userAddress);
    const notificationMessage = `User with account ${purchaseEvent.userAddress} purchased your product ` +
      `${purchaseEvent.dataProductAddress}. Please finalise this transaction.`;
    const request = {
      dataProductAddress: purchaseEvent.dataProductAddress,
      buyerAddress: purchaseEvent.userAddress
    };

    if (!transaction || transaction.finalised || this.find(request)) {
      notification.read = true;
      this._notificationsService.saveNotifications();
      return notificationMessage;
    }

    this.add(request);

    return notificationMessage;
  }

  reset(): void {
    return this._dataProductNotificationBase.reset();
  }

  getEntries(): Observable<PurchaseEntry[]> {
    return this._dataProductNotificationBase.getEntries();
  }
}

