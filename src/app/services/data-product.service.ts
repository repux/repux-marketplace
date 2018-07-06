import { Injectable, OnDestroy } from '@angular/core';
import { RepuxWeb3Service } from './repux-web3.service';
import { Observable, Observer } from 'rxjs';
import {
  ContractEvent,
  DataProductEvent,
  DataProductTransaction,
  DataProductUpdateAction,
  TransactionResult
} from 'repux-web3-api';
import { filter } from 'rxjs/internal/operators';
import { WalletService } from './wallet.service';
import Wallet from '../shared/models/wallet';
import { StorageService } from './storage.service';
import { Subscription } from 'rxjs/internal/Subscription';
import RepuxWeb3Api from 'repux-web3-api/repux-web3-api';
import BigNumber from 'bignumber.js';

@Injectable({
  providedIn: 'root'
})
export class DataProductService implements OnDestroy {
  private static readonly STORAGE_PREFIX = 'DataProductService_';
  private readonly _defaultData = {
    lastBlock: 0
  };
  private _promises = {};
  private _dataProductUpdateObservable: Observable<DataProductEvent>;
  private _wallet: Wallet;
  private _productUpdateEvent: ContractEvent;
  private _walletSubscription: Subscription;

  constructor(
    private _repuxWeb3Service: RepuxWeb3Service,
    private _walletService: WalletService,
    private _storageService: StorageService) {
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  private get _api(): Promise<RepuxWeb3Api> {
    return new Promise<RepuxWeb3Api>(async (resolve) => {
      const web3Service: RepuxWeb3Service = await this._repuxWeb3Service;
      const repuxWeb3Api = await web3Service.getRepuxApiInstance();
      resolve(repuxWeb3Api);
    });
  }

  async getDataProductData(dataProductAddress: string) {
    return (await this._api).getDataProduct(dataProductAddress);
  }

  async getTransactionData(dataProductAddress: string, buyerAddress: string): Promise<DataProductTransaction> {
    return (await this._api).getDataProductTransaction(dataProductAddress, buyerAddress);
  }

  async publishDataProduct(metaFileHash: string, price: BigNumber, daysForDeliver: number): Promise<TransactionResult> {
    return (await this._api).createDataProduct(metaFileHash, price, daysForDeliver);
  }

  async purchaseDataProduct(dataProductAddress: string, buyerPublicKey: string): Promise<TransactionResult> {
    return (await this._api).purchaseDataProduct(dataProductAddress, buyerPublicKey);
  }

  async finaliseDataProductPurchase(dataProductAddress: string, buyerAddress: string, buyerMetaHash: string): Promise<TransactionResult> {
    return (await this._api).finaliseDataProductPurchase(dataProductAddress, buyerAddress, buyerMetaHash);
  }

  async getBoughtDataProducts(): Promise<string[]> {
    const api: RepuxWeb3Api = await this._api;
    return api.getBoughtDataProducts();
  }

  async getBoughtAndFinalisedDataProducts(): Promise<string[]> {
    const api: RepuxWeb3Api = await this._api;
    return api.getBoughtAndFinalisedDataProducts();
  }

  async getCreatedDataProducts(): Promise<string[]> {
    const api: RepuxWeb3Api = await this._api;
    return api.getCreatedDataProducts();
  }

  async withdrawFundsFromDataProduct(dataProductAddress: string): Promise<TransactionResult> {
    return (await this._api).withdrawFundsFromDataProduct(dataProductAddress);
  }

  async disableDataProduct(dataProductAddress: string): Promise<TransactionResult> {
    return (await this._api).disableDataProduct(dataProductAddress);
  }

  async cancelDataProductPurchase(dataProductAddress: string): Promise<TransactionResult> {
    return (await this._api).cancelDataProductPurchase(dataProductAddress);
  }

  watchForDataProductUpdate(_dataProductAddress?: string, _dataProductUpdateAction?: DataProductUpdateAction)
    : Observable<DataProductEvent> {
    if (!this._wallet) {
      return;
    }

    if (!this._dataProductUpdateObservable) {
      this._dataProductUpdateObservable = new Observable(observer => this._dataProductUpdateObserver(observer));
    }

    return this._dataProductUpdateObservable.pipe(
      filter(event => !_dataProductAddress || _dataProductAddress === event.dataProductAddress),
      filter(event => !_dataProductUpdateAction || _dataProductUpdateAction === event.action)
    );
  }

  ngOnDestroy() {
    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }
  }

  private _getStorageKey(): string {
    return DataProductService.STORAGE_PREFIX + this._wallet.address;
  }

  private _readFromStore(): any {
    const saved = this._storageService.getItem(this._getStorageKey());

    if (saved) {
      return saved;
    }

    this._saveToStore(this._defaultData);
    return this._defaultData;
  }

  private _saveToStore(data: any): void {
    this._storageService.setItem(this._getStorageKey(), data);
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    if (this._productUpdateEvent) {
      this._productUpdateEvent.stopWatching();
      this._productUpdateEvent = null;
      this._dataProductUpdateObservable = null;
    }
  }

  private _getLastReadBlock(): number {
    const config = this._readFromStore();
    return config.lastBlock;
  }

  private _setLastReadBlock(lastBlock): void {
    const config = this._readFromStore();
    config.lastBlock = lastBlock;
    this._saveToStore(config);
  }

  private _dataProductUpdateObserver(observer: Observer<DataProductEvent>) {
    const config = {
      fromBlock: this._getLastReadBlock() + 1,
      toBlock: 'latest'
    };

    this._api.then(api => {
      api.watchForDataProductUpdate(config, (result: DataProductEvent) => {
        this._setLastReadBlock(result.blockNumber);
        observer.next(result);
      }).then(event => this._productUpdateEvent = event);
    });
  }
}
