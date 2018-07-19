import { Injectable, OnDestroy } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { DataProductListService } from '../../services/data-product-list.service';
import { DataProduct } from '../../shared/models/data-product';
import { environment } from '../../../environments/environment';
import { EsDataProduct } from '../../shared/models/es-data-product';
import { pluck } from 'rxjs/operators';
import { DataProductEvent, DataProductUpdateAction } from 'repux-web3-api';
import { DataProductService } from '../../services/data-product.service';

export function getAwaitingFinalisationDataProductsQuery(walletAddress: string) {
  return {
    bool: {
      must: [
        {
          nested: {
            path: 'transactions',
            query: {
              bool: {
                must: [
                  { match: { 'transactions.buyerAddress': walletAddress } },
                  { match: { 'transactions.finalised': false } }
                ]
              }
            }
          }
        }
      ]
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class AwaitingFinalisationService implements OnDestroy {
  private _wallet: Wallet;

  private _walletSubscription: Subscription;
  private _updateSubscription?: Subscription;
  private _purchaseSubscription?: Subscription;
  private _purchaseCancelSubscription?: Subscription;
  private _purchaseFinaliseSubscription?: Subscription;
  private _fetchSubscription?: Subscription;

  private _productsSubject = new BehaviorSubject<DataProduct[]>([]);

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _dataProductListService: DataProductListService
  ) {
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  getProducts(): Observable<DataProduct[]> {
    return this._productsSubject.asObservable();
  }

  getProductsValue(): DataProduct[] {
    return this._productsSubject.getValue();
  }

  refresh(wallet: Wallet): void {
    if (!wallet) {
      this._productsSubject.next([]);

      return;
    }

    if (this._fetchSubscription) {
      this._fetchSubscription.unsubscribe();
    }

    this._fetchSubscription = this._dataProductListService
      .getDataProducts(getAwaitingFinalisationDataProductsQuery(wallet.address), '', environment.maxNotificationsProductsNumber).pipe(
        pluck('hits')
      )
      .subscribe((result: EsDataProduct[]) => {
        this._productsSubject.next(result.map(esDataProduct => esDataProduct.source));
      });
  }

  addProduct(dataProduct: DataProduct): void {
    const currentValue = this.getProductsValue();
    if (!currentValue.find(_dataProduct => _dataProduct.address === dataProduct.address)) {
      this._productsSubject.next([ ...currentValue, dataProduct ]);
    }
  }

  removeProduct(dataProduct: DataProduct): void {
    this._productsSubject.next(
      this.getProductsValue()
        .filter(_dataProduct => _dataProduct.address !== dataProduct.address)
    );
  }

  findProduct(dataProductAddress: string): DataProduct {
    return this.getProductsValue().find(dataProduct => dataProduct.address === dataProductAddress);
  }

  ngOnDestroy(): void {
    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }

    if (this._fetchSubscription) {
      this._fetchSubscription.unsubscribe();
    }

    this._unsubscribeFromBlockchainEvents();

    this._productsSubject.complete();
  }

  private _onWalletChange(wallet: Wallet): Wallet {
    if (this._wallet === wallet) {
      return;
    }

    const previousWalletValue = this._wallet;
    this._wallet = wallet;

    if (!previousWalletValue && wallet) {
      this._unsubscribeFromBlockchainEvents();

      this._updateSubscription = this._dataProductService.watchForDataProductUpdate(null, DataProductUpdateAction.UPDATE)
        .subscribe(dataProductEvent => this._onDataProductUpdate(dataProductEvent));

      this._purchaseSubscription = this._dataProductService.watchForDataProductUpdate(null, DataProductUpdateAction.PURCHASE)
        .subscribe(dataProductEvent => this._onDataProductPurchaseUpdate(dataProductEvent));

      this._purchaseCancelSubscription = this._dataProductService.watchForDataProductUpdate(null, DataProductUpdateAction.CANCEL_PURCHASE)
        .subscribe(dataProductEvent => this._onDataProductPurchaseUpdate(dataProductEvent));

      this._purchaseFinaliseSubscription = this._dataProductService.watchForDataProductUpdate(null, DataProductUpdateAction.FINALISE)
        .subscribe(dataProductEvent => this._onDataProductPurchaseUpdate(dataProductEvent));
    }

    this.refresh(this._wallet);

    return;
  }

  private _onDataProductUpdate(dataProductEvent: DataProductEvent) {
    if (this.getProductsValue().find(dataProduct => dataProduct.address === dataProductEvent.dataProductAddress)) {
      this.refresh(this._wallet);
    }
  }

  private _onDataProductPurchaseUpdate(dataProductEvent: DataProductEvent) {
    if (dataProductEvent.userAddress === this._wallet.address) {
      this.refresh(this._wallet);
    }
  }

  private _unsubscribeFromBlockchainEvents() {
    if (this._updateSubscription) {
      this._updateSubscription.unsubscribe();
    }

    if (this._purchaseSubscription) {
      this._purchaseSubscription.unsubscribe();
    }

    if (this._purchaseCancelSubscription) {
      this._purchaseCancelSubscription.unsubscribe();
    }

    if (this._purchaseFinaliseSubscription) {
      this._purchaseFinaliseSubscription.unsubscribe();
    }
  }
}
