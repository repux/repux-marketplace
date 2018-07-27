import { Injectable, OnDestroy } from '@angular/core';
import { RepuxWeb3Service } from './repux-web3.service';
import { Observable } from 'rxjs';
import {
  ContractEvent,
  DataProductEvent,
  DataProductTransaction,
  DataProductUpdateAction,
  TransactionResult
} from 'repux-web3-api';
import { filter, map } from 'rxjs/internal/operators';
import { WalletService } from './wallet.service';
import Wallet from '../shared/models/wallet';
import { StorageService } from './storage.service';
import { Subscription } from 'rxjs/internal/Subscription';
import RepuxWeb3Api from 'repux-web3-api/repux-web3-api';
import BigNumber from 'bignumber.js';
import { WebsocketService, WebsocketEvent } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class DataProductService implements OnDestroy {
  private websocketMessage$: Observable<DataProductEvent>;
  private _wallet: Wallet;
  private _productUpdateEvent: ContractEvent;
  private _walletSubscription: Subscription;

  constructor(
    private _repuxWeb3Service: RepuxWeb3Service,
    private _walletService: WalletService,
    private _storageService: StorageService,
    private _websocketService: WebsocketService
  ) {
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

  async publishDataProduct(metaFileHash: string, price: BigNumber, daysToDeliver: number): Promise<TransactionResult> {
    return (await this._api).createDataProduct(metaFileHash, price, daysToDeliver);
  }

  async purchaseDataProduct(dataProductAddress: string, buyerPublicKey: string): Promise<TransactionResult> {
    return (await this._api).purchaseDataProduct(dataProductAddress, buyerPublicKey);
  }

  async finaliseDataProductPurchase(dataProductAddress: string, buyerAddress: string, buyerMetaHash: string): Promise<TransactionResult> {
    return (await this._api).finaliseDataProductPurchase(dataProductAddress, buyerAddress, buyerMetaHash);
  }

  async rateDataProductPurchase(dataProductAddress: string, score: BigNumber): Promise<TransactionResult> {
    return (await this._api).rateDataProductPurchase(dataProductAddress, score);
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

  async getAllDataProductTransactions(dataProductAddress: string): Promise<DataProductTransaction[]> {
    const buyerAddresses = await (await this._api).getDataProductBuyersAddresses(dataProductAddress);

    return Promise.all(
      buyerAddresses.map(async buyerAddress => {
        const transaction = await this.getTransactionData(dataProductAddress, buyerAddress);
        transaction.buyerAddress = buyerAddress;

        return transaction;
      })
    );
  }

  watchForDataProductUpdate(_dataProductAddress?: string, _dataProductUpdateAction?: DataProductUpdateAction)
    : Observable<DataProductEvent> {
    if (!this._wallet) {
      return;
    }

    if (!this.websocketMessage$) {
      this.websocketMessage$ = this._websocketService.onEvent(WebsocketEvent.DataProductUpdate);
    }

    return this.websocketMessage$.pipe(
      map(data => {
        return {
          dataProductAddress: data.args.dataProduct,
          blockNumber: data.blockNumber,
          action: data.args.action,
          userAddress: data.args.sender
        } as DataProductEvent;
      }),
      filter(event => {
        return !_dataProductAddress || _dataProductAddress === event.dataProductAddress;
      }),
      filter(event => {
        return !_dataProductUpdateAction || _dataProductUpdateAction === event.action;
      })
    );
  }

  ngOnDestroy() {
    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    if (this._productUpdateEvent) {
      this._productUpdateEvent.stopWatching();
      this._productUpdateEvent = null;
    }
  }
}
