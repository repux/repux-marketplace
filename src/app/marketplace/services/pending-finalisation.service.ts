import { Injectable, OnDestroy } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { DataProductListService } from '../../services/data-product-list.service';
import { DataProduct } from '../../shared/models/data-product';
import { environment } from '../../../environments/environment';
import { pluck } from 'rxjs/operators';
import { DataProductUpdateAction } from 'repux-web3-api';
import { DataProductService } from '../../services/data-product.service';
import { MyActiveListingsService } from './my-active-listings.service';
import { DataProductOrder } from '../../shared/models/data-product-order';
import { DataProductEvent } from '../../shared/models/data-product-event';

export function getPendingFinalisationDataProductsQuery(walletAddress: string) {
  return {
    bool: {
      must_not: [ { match: { disabled: true } } ],
      must: [
        { match: { ownerAddress: walletAddress } },
        {
          nested: {
            path: 'orders',
            query: {
              bool: {
                must: [
                  { match: { 'orders.finalised': false } }
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
export class PendingFinalisationService implements OnDestroy {
  private _wallet: Wallet;

  private _walletSubscription: Subscription;
  private _updateSubscription?: Subscription;
  private _purchaseSubscription?: Subscription;
  private _purchaseCancelSubscription?: Subscription;
  private _purchaseFinaliseSubscription?: Subscription;
  private _fetchSubscription?: Subscription;

  private _productsSubject = new BehaviorSubject<DataProduct[]>([]);
  private _ordersSubject = new BehaviorSubject<DataProductOrder[]>([]);

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _dataProductListService: DataProductListService,
    private _myActiveListingsService: MyActiveListingsService
  ) {
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  getProducts(): Observable<DataProduct[]> {
    return this._productsSubject.asObservable();
  }

  getOrders(): Observable<DataProductOrder[]> {
    return this._ordersSubject.asObservable();
  }

  getProductsValue(): DataProduct[] {
    return this._productsSubject.getValue();
  }

  getOrdersValue(): DataProductOrder[] {
    return this._ordersSubject.getValue();
  }

  findOrder(dataProductAddress: string, buyerAddress: string): DataProductOrder {
    const product = this._productsSubject.getValue().find(dataProduct => dataProduct.address === dataProductAddress);

    if (!product || !product.orders) {
      return;
    }

    return product.orders.find(_order => _order.buyerAddress === buyerAddress);
  }

  removeOrder(dataProductAddress: string, buyerAddress: string): void {
    const product = this._productsSubject.getValue().find(dataProduct => dataProduct.address === dataProductAddress);

    if (!product || !product.orders) {
      return;
    }

    const order = product.orders.find(_order => _order.buyerAddress === buyerAddress);

    if (!order) {
      return;
    }

    product.orders = product.orders.filter(_order => _order.buyerAddress !== buyerAddress);
    this._pluckOrdersFromDataProducts();
  }

  refresh(wallet: Wallet): Subscription {
    if (!wallet) {
      this._productsSubject.next([]);
      this._pluckOrdersFromDataProducts();

      return;
    }

    if (this._fetchSubscription) {
      this._fetchSubscription.unsubscribe();
    }

    this._fetchSubscription = this._dataProductListService
      .getDataProducts(getPendingFinalisationDataProductsQuery(wallet.address), '', environment.maxNotificationsProductsNumber).pipe(
        pluck('hits')
      )
      .subscribe((result: DataProduct[]) => {
        this._productsSubject.next(result);
        this._pluckOrdersFromDataProducts();
      });

    return this._fetchSubscription;
  }

  addProduct(dataProduct: DataProduct): void {
    const currentValue = this.getProductsValue();
    if (!currentValue.find(_dataProduct => _dataProduct.address === dataProduct.address)) {
      this._productsSubject.next([ ...currentValue, dataProduct ]);
      this._pluckOrdersFromDataProducts();
    }
  }

  removeProduct(dataProduct: DataProduct): void {
    this._productsSubject.next(
      this.getProductsValue()
        .filter(_dataProduct => _dataProduct.address !== dataProduct.address)
    );
    this._pluckOrdersFromDataProducts();
  }

  findProduct(dataProductAddress: string): DataProduct {
    return this.getProductsValue().find(dataProduct => dataProduct.address === dataProductAddress);
  }

  ngOnDestroy(): void {
    this._walletSubscription.unsubscribe();

    if (this._fetchSubscription) {
      this._fetchSubscription.unsubscribe();
    }

    this._unsubscribeFromBlockchainEvents();

    this._productsSubject.complete();

    this._ordersSubject.complete();
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

      this._updateSubscription = this._dataProductService.watchForDataProductUpdate(null, DataProductUpdateAction.PURCHASE)
        .subscribe(dataProductEvent => this._onDataProductUpdate(dataProductEvent));

      this._purchaseCancelSubscription = this._dataProductService.watchForDataProductUpdate(null, DataProductUpdateAction.CANCEL_PURCHASE)
        .subscribe(dataProductEvent => this._onDataProductUpdate(dataProductEvent));

      this._purchaseFinaliseSubscription = this._dataProductService.watchForDataProductUpdate(null, DataProductUpdateAction.FINALISE)
        .subscribe(dataProductEvent => this._onDataProductUpdate(dataProductEvent));
    }

    this.refresh(this._wallet);

    return;
  }

  private _onDataProductUpdate(dataProductEvent: DataProductEvent) {
    if (this._myActiveListingsService.getProductsValue().find(dataProduct => dataProduct.address === dataProductEvent.dataProductAddress)) {
      this.refresh(this._wallet);
    }
  }

  private _pluckOrdersFromDataProducts() {
    let orders = [];
    this._productsSubject.getValue().forEach(product =>
      orders = [ ...orders, ...product.orders.filter(order => !order.finalised) ]
    );
    this._ordersSubject.next(orders);
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
