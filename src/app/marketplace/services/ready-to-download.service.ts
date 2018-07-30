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

export function getReadyToDownloadDataProductsQuery(walletAddress: string) {
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
                  { match: { 'transactions.finalised': true } }
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
export class ReadyToDownloadService implements OnDestroy {
  private _wallet: Wallet;

  private _walletSubscription: Subscription;
  private _finaliseSubscription?: Subscription;
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

  refresh(wallet: Wallet): Subscription {
    if (!wallet) {
      this._productsSubject.next([]);

      return;
    }

    if (this._fetchSubscription) {
      this._fetchSubscription.unsubscribe();
    }

    this._fetchSubscription = this._dataProductListService
      .getDataProducts(getReadyToDownloadDataProductsQuery(wallet.address), '', environment.maxNotificationsProductsNumber).pipe(
        pluck('hits')
      )
      .subscribe((result: DataProduct[]) => this._productsSubject.next(result));

    return this._fetchSubscription;
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
    this._walletSubscription.unsubscribe();

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

      this._finaliseSubscription = this._dataProductService.watchForDataProductUpdate(null, DataProductUpdateAction.FINALISE)
        .subscribe(dataProductEvent => this._onDataProductUpdate(dataProductEvent));
    }

    this.refresh(this._wallet);

    return;
  }

  private _onDataProductUpdate(dataProductEvent: DataProductEvent) {
    if (dataProductEvent.userAddress === this._wallet.address) {
      this.refresh(this._wallet);
    }
  }

  private _unsubscribeFromBlockchainEvents() {
    if (this._finaliseSubscription) {
      this._finaliseSubscription.unsubscribe();
    }
  }
}
