import { Injectable, OnDestroy } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { DataProductListService } from '../../services/data-product-list.service';
import { DataProduct } from '../../shared/models/data-product';
import { environment } from '../../../environments/environment';
import { pluck } from 'rxjs/operators';
import { DataProductEvent, DataProductUpdateAction } from 'repux-web3-api';
import { DataProductService } from '../../services/data-product.service';
import { MyActiveListingsService } from './my-active-listings.service';
import { DataProductTransaction } from '../../shared/models/data-product-transaction';

export function getPendingFinalisationDataProductsQuery(walletAddress: string) {
  return {
    bool: {
      must_not: [ { match: { disabled: true } } ],
      must: [
        { match: { ownerAddress: walletAddress } },
        {
          nested: {
            path: 'transactions',
            query: {
              bool: {
                must: [
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
export class PendingFinalisationService implements OnDestroy {
  private _wallet: Wallet;

  private _walletSubscription: Subscription;
  private _updateSubscription?: Subscription;
  private _purchaseSubscription?: Subscription;
  private _purchaseCancelSubscription?: Subscription;
  private _purchaseFinaliseSubscription?: Subscription;
  private _fetchSubscription?: Subscription;

  private _productsSubject = new BehaviorSubject<DataProduct[]>([]);
  private _transactionsSubject = new BehaviorSubject<DataProductTransaction[]>([]);

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

  getTransactions(): Observable<DataProductTransaction[]> {
    return this._transactionsSubject.asObservable();
  }

  getProductsValue(): DataProduct[] {
    return this._productsSubject.getValue();
  }

  getTransactionsValue(): DataProductTransaction[] {
    return this._transactionsSubject.getValue();
  }

  findTransaction(dataProductAddress: string, buyerAddress: string): DataProductTransaction {
    const product = this._productsSubject.getValue().find(dataProduct => dataProduct.address === dataProductAddress);

    if (!product || !product.transactions) {
      return;
    }

    return product.transactions.find(_transaction => _transaction.buyerAddress === buyerAddress);
  }

  removeTransaction(dataProductAddress: string, buyerAddress: string): void {
    const product = this._productsSubject.getValue().find(dataProduct => dataProduct.address === dataProductAddress);

    if (!product || !product.transactions) {
      return;
    }

    const transaction = product.transactions.find(_transaction => _transaction.buyerAddress === buyerAddress);

    if (!transaction) {
      return;
    }

    product.transactions = product.transactions.filter(_transaction => _transaction.buyerAddress !== buyerAddress);
    this._pluckTransactionsFromDataProducts();
  }

  refresh(wallet: Wallet): Subscription {
    if (!wallet) {
      this._productsSubject.next([]);
      this._pluckTransactionsFromDataProducts();

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
        this._pluckTransactionsFromDataProducts();
      });

    return this._fetchSubscription;
  }

  addProduct(dataProduct: DataProduct): void {
    const currentValue = this.getProductsValue();
    if (!currentValue.find(_dataProduct => _dataProduct.address === dataProduct.address)) {
      this._productsSubject.next([ ...currentValue, dataProduct ]);
      this._pluckTransactionsFromDataProducts();
    }
  }

  removeProduct(dataProduct: DataProduct): void {
    this._productsSubject.next(
      this.getProductsValue()
        .filter(_dataProduct => _dataProduct.address !== dataProduct.address)
    );
    this._pluckTransactionsFromDataProducts();
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

    this._transactionsSubject.complete();
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

  private _pluckTransactionsFromDataProducts() {
    let transactions = [];
    this._productsSubject.getValue().forEach(product =>
      transactions = [ ...transactions, ...product.transactions.filter(transaction => !transaction.finalised) ]
    );
    this._transactionsSubject.next(transactions);
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
