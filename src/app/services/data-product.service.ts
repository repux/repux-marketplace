import { Injectable } from '@angular/core';
import { RepuxWeb3Service } from './repux-web3.service';
import BigNumber from 'bignumber.js';
import { Observable, Observer } from 'rxjs';
import { DataProductEvent, DataProductUpdateAction } from 'repux-web3-api';
import { filter } from 'rxjs/internal/operators';
import { DataProductTransaction, TransactionResult } from 'repux-web3-api/repux-web3-api';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class DataProductService {
  private static readonly STORAGE_PREFIX = 'DataProductService_';
  private _promises = {};
  private _dataProductUpdateObservable: Observable<DataProductEvent>;
  private _storage = localStorage;

  constructor(
    private _repuxWeb3Service: RepuxWeb3Service,
    private _walletService: WalletService) {
  }

  private get _api() {
    return this._repuxWeb3Service.getRepuxApiInstance();
  }

  private async _getConfig(): Promise<{ lastBlock: number}> {
    const saved = this._storage.getItem(DataProductService.STORAGE_PREFIX + 'config');
    const wallet = await this._walletService.getData();

    if (saved) {
      const parsed = JSON.parse(saved);

      if (parsed.address === wallet.address) {
        return parsed;
      }
    }

    const config = {
      lastBlock: 0,
      address:  wallet.address
    };

    await this._setConfig(config);

    return config;
  }

  private async _setConfig(config): Promise<void> {
    const wallet = await this._walletService.getData();
    config.address = wallet.address;
    this._storage.setItem(DataProductService.STORAGE_PREFIX + 'config', JSON.stringify(config));
  }

  private async _getLastReadBlock(): Promise<number> {
    const config = await this._getConfig();
    return config.lastBlock;
  }

  private async _setLastReadBlock(lastBlock): Promise<void> {
    const config = await this._getConfig();
    config.lastBlock = lastBlock;
    await this._setConfig(config);
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

  getDataProductData(dataProductAddress: string) {
    return this._api.getDataProduct(dataProductAddress);
  }

  getTransactionData(dataProductAddress: string, buyerAddress: string): Promise<DataProductTransaction> {
    return this._api.getDataProductTransaction(dataProductAddress, buyerAddress);
  }

  publishDataProduct(metaFileHash: string, price: BigNumber): Promise<TransactionResult> {
    return this._api.createDataProduct(metaFileHash, price);
  }

  purchaseDataProduct(dataProductAddress: string, buyerPublicKey: string): Promise<TransactionResult> {
    return this._api.purchaseDataProduct(dataProductAddress, buyerPublicKey);
  }

  approveDataProductPurchase(dataProductAddress: string, buyerAddress: string, buyerMetaHash: string): Promise<TransactionResult> {
    return this._api.approveDataProductPurchase(dataProductAddress, buyerAddress, buyerMetaHash);
  }

  getBoughtDataProducts(): Promise<string[]> {
    return this._getDebouncedPromise('boughtData', 'getBoughtDataProducts');
  }

  getBoughtAndApprovedDataProducts(): Promise<string[]> {
    return this._getDebouncedPromise('boughtAndApprovedData', 'getBoughtAndApprovedDataProducts');
  }

  getCreatedDataProducts(): Promise<string[]> {
    return this._getDebouncedPromise('createdData', 'getCreatedDataProducts');
  }

  watchForDataProductUpdate(_dataProductAddress?: string, _dataProductUpdateAction?: DataProductUpdateAction)
    : Observable<DataProductEvent> {
    if (!this._dataProductUpdateObservable) {
      this._dataProductUpdateObservable = new Observable(observer => this._dataProductUpdateObserver(observer));
    }

    return this._dataProductUpdateObservable.pipe(
      filter(event => !_dataProductAddress || _dataProductAddress === event.dataProductAddress),
      filter(event => !_dataProductUpdateAction || _dataProductUpdateAction === event.action)
    );
  }

  private _dataProductUpdateObserver(observer: Observer<DataProductEvent>) {
    this._getLastReadBlock().then((lastBlock: number) => {
      this._api.watchForDataProductUpdate({ fromBlock: lastBlock + 1, toBlock: 'latest' }, async (result: DataProductEvent) => {
        await this._setLastReadBlock(result.blockNumber);
        observer.next(result);
      });
    });
  }
}
