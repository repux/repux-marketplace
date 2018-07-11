import { NotificationType } from '../../notifications/notification-type';
import { Notification } from '../../notifications/notification';
import { DataProductService } from '../data-product.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PurchaseEntry } from '../data-product-notifications.service';
import { AwaitingFinalisationService } from './awaiting-finalisation.service';
import { PendingFinalisationService } from './pending-finalisation.service';
import { Injectable } from '@angular/core';
import { DataProductNotificationBase } from './data-product-notification-base';
import { Observable } from 'rxjs/internal/Observable';
import { DataProductNotificationInterface } from './data-product-notification-interface';

@Injectable({
  providedIn: 'root'
})
export class ReadyToDownloadService implements DataProductNotificationInterface {
  public readonly notificationType: NotificationType = NotificationType.DATA_PRODUCT_FINALISED;
  private _dataProductNotificationBase = new DataProductNotificationBase();

  constructor(
    private _dataProductService: DataProductService,
    private _notificationsService: NotificationsService,
    private _awaitingFinalisationService: AwaitingFinalisationService,
    private _pendingFinalisationService: PendingFinalisationService
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
    const finaliseEvent = notification.data.finaliseEvent;
    const purchaseEntry = {
      dataProductAddress: finaliseEvent.dataProductAddress,
      buyerAddress: finaliseEvent.userAddress
    };

    this._awaitingFinalisationService.remove(purchaseEntry);
    this._pendingFinalisationService.remove(purchaseEntry);

    if (!this.find(purchaseEntry) && this._notificationsService.wallet.address === finaliseEvent.userAddress) {
      this.add(purchaseEntry);

      return `Your purchase for product ${finaliseEvent.dataProductAddress} is finalised.`;
    }

    return `Your have finalised purchase for your product ${finaliseEvent.dataProductAddress}.`;
  }

  reset(): void {
    return this._dataProductNotificationBase.reset();
  }

  getEntries(): Observable<PurchaseEntry[]> {
    return this._dataProductNotificationBase.getEntries();
  }
}
