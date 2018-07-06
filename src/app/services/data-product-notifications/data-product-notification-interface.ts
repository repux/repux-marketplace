import { Notification } from '../../notifications/notification';
import { PurchaseEntry } from '../data-product-notifications.service';
import { Observable } from 'rxjs/internal/Observable';
import { NotificationType } from '../../notifications/notification-type';

export interface DataProductNotificationInterface {
  readonly notificationType: NotificationType;

  find(purchaseEntry: PurchaseEntry): PurchaseEntry;

  add(purchaseEntry: PurchaseEntry): void;

  remove(purchaseEntry: PurchaseEntry): void;

  parse(notification: Notification): Promise<string>;

  reset(): void;

  getEntries(): Observable<PurchaseEntry[]>;
}
