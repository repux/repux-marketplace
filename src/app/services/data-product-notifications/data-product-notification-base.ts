import { PurchaseEntry } from '../data-product-notifications.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

export class DataProductNotificationBase {
  private _purchaseEntriesSubject = new BehaviorSubject<PurchaseEntry[]>([]);

  find(purchaseEntry: PurchaseEntry): PurchaseEntry {
    return this._purchaseEntriesSubject.getValue().find((_purchaseEntry: PurchaseEntry) =>
      purchaseEntry.dataProductAddress === _purchaseEntry.dataProductAddress &&
      purchaseEntry.buyerAddress === _purchaseEntry.buyerAddress
    );
  }

  add(purchaseEntry: PurchaseEntry): void {
    if (!this.find(purchaseEntry)) {
      this._purchaseEntriesSubject.next([
        ...this._purchaseEntriesSubject.getValue(),
        purchaseEntry
      ]);
    }
  }

  remove(purchaseEntry: PurchaseEntry): void {
    const foundEntry = this.find(purchaseEntry);
    this._purchaseEntriesSubject.next(
      this._purchaseEntriesSubject.getValue()
        .filter((_purchaseEntry: PurchaseEntry) => _purchaseEntry !== foundEntry)
    );
  }

  reset(): void {
    this._purchaseEntriesSubject.next([]);
  }

  getEntries(): Observable<PurchaseEntry[]> {
    return this._purchaseEntriesSubject.asObservable();
  }
}
