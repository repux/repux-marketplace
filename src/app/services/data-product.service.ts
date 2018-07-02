import { Injectable } from '@angular/core';
import { RepuxWeb3Service } from './repux-web3.service';
import BigNumber from 'bignumber.js';
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

@Injectable({
  providedIn: 'root'
})
export class DataProductService {
  private static readonly STORAGE_PREFIX = 'DataProductService_';
  private readonly _defaultData = {
    lastBlock: 0
  };
  private _promises = {};
  private _dataProductUpdateObservable: Observable<DataProductEvent>;
  private _wallet: Wallet;
  private _productUpdateEvent: ContractEvent;

  constructor(
    private _repuxWeb3Service: RepuxWeb3Service,
    private _walletService: WalletService,
    private _storageService: StorageService) {
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  private get _api() {
    return this._repuxWeb3Service.getRepuxApiInstance();
  }

  getDataProductData(dataProductAddress: string) {
    return this._api.getDataProduct(dataProductAddress);
  }

  getTransactionData(dataProductAddress: string, buyerAddress: string): Promise<DataProductTransaction> {
    return this._api.getDataProductTransaction(dataProductAddress, buyerAddress);
  }

  publishDataProduct(metaFileHash: string, price: BigNumber, daysForDeliver: number): Promise<TransactionResult> {
    return this._api.createDataProduct(metaFileHash, price, daysForDeliver);
  }

  purchaseDataProduct(dataProductAddress: string, buyerPublicKey: string): Promise<TransactionResult> {
    return this._api.purchaseDataProduct(dataProductAddress, buyerPublicKey);
  }

  finaliseDataProductPurchase(dataProductAddress: string, buyerAddress: string, buyerMetaHash: string): Promise<TransactionResult> {
    return this._api.finaliseDataProductPurchase(dataProductAddress, buyerAddress, buyerMetaHash);
  }

  getBoughtDataProducts(): Promise<string[]> {
    return this._getDebouncedPromise('boughtData', 'getBoughtDataProducts');
  }

  getBoughtAndFinalisedDataProducts(): Promise<string[]> {
    return this._getDebouncedPromise('boughtAndFinalisedData', 'getBoughtAndFinalisedDataProducts');
  }

  getCreatedDataProducts(): Promise<string[]> {
    return this._getDebouncedPromise('createdData', 'getCreatedDataProducts');
  }

  withdrawFundsFromDataProduct(dataProductAddress: string): Promise<TransactionResult> {
    return this._api.withdrawFundsFromDataProduct(dataProductAddress);
  }

  disableDataProduct(dataProductAddress: string): Promise<TransactionResult> {
    return this._api.disableDataProduct(dataProductAddress);
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

  private _getDebouncedPromise(promiseName, functionName) {
    if (this._promises[ promiseName ]) {
      return this._promises[ promiseName ];
    }

    this._promises[ promiseName ] = this._api[ functionName ]();
    this._promises[ promiseName ]
      .then(() => delete this._promises[ promiseName ])
      .catch(() => delete this._promises[ promiseName ]);

    return this._promises[ promiseName ];
  }

  private _dataProductUpdateObserver(observer: Observer<DataProductEvent>) {
    const config = {
      fromBlock: this._getLastReadBlock() + 1,
      toBlock: 'latest'
    };

    this._api.watchForDataProductUpdate(config, (result: DataProductEvent) => {
      this._setLastReadBlock(result.blockNumber);
      observer.next(result);
    }).then(event => this._productUpdateEvent = event);
  }
}
