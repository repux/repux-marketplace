import { Injectable, OnDestroy } from '@angular/core';
import { RepuxWeb3Service } from './repux-web3.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataProduct, DataProductOrder, DataProductUpdateAction, RepuxWeb3Api } from 'repux-web3-api';
import { filter, map } from 'rxjs/internal/operators';
import { WalletService } from './wallet.service';
import Wallet from '../shared/models/wallet';
import { Subscription } from 'rxjs/internal/Subscription';
import BigNumber from 'bignumber.js';
import { WebsocketEvent, WebsocketService } from './websocket.service';
import { DataProductEvent } from '../shared/models/data-product-event';
import { BlockchainTransactionScope } from '../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { TransactionService } from '../shared/services/transaction.service';
import { TransactionEvent } from '../shared/models/transaction-event';

@Injectable({
  providedIn: 'root'
})
export class DataProductService implements OnDestroy {
  private websocketMessage$: Observable<any>;
  private wallet: Wallet;
  private walletSubscription: Subscription;

  constructor(
    private repuxWeb3Service: RepuxWeb3Service,
    private walletService: WalletService,
    private websocketService: WebsocketService,
    private transactionService: TransactionService
  ) {
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
  }

  private get api(): Promise<RepuxWeb3Api> {
    return new Promise<RepuxWeb3Api>(async (resolve) => {
      const web3Service: RepuxWeb3Service = await this.repuxWeb3Service;
      const repuxWeb3Api = await web3Service.getRepuxApiInstance();
      resolve(repuxWeb3Api);
    });
  }

  async getDataProductData(dataProductAddress: string): Promise<DataProduct> {
    return (await this.api).getDataProduct(dataProductAddress);
  }

  async getOrderData(dataProductAddress: string, buyerAddress: string): Promise<DataProductOrder> {
    return (await this.api).getDataProductOrder(dataProductAddress, buyerAddress);
  }

  async isTokensTransferForDataProductPurchaseApproved(dataProductAddress: string): Promise<Boolean> {
    return (await this.api).isTransferForPurchaseApproved(dataProductAddress);
  }

  async getAllDataProductOrders(dataProductAddress: string): Promise<DataProductOrder[]> {
    const buyerAddresses = await (await this.api).getDataProductBuyersAddresses(dataProductAddress);
    return Promise.all(
      buyerAddresses.map(buyerAddress => this.getOrderData(dataProductAddress, buyerAddress))
    );
  }

  publishDataProduct(metaFileHash: string, price: BigNumber, daysToDeliver: number): Observable<TransactionEvent> {
    const subject = new BehaviorSubject<TransactionEvent>(undefined);

    this.transactionService.handleTransaction(
      subject,
      BlockchainTransactionScope.DataProduct,
      metaFileHash,
      ActionButtonType.Publish,
      async () => (await this.api).createDataProduct(metaFileHash, price, daysToDeliver)
    );

    return subject.asObservable();
  }

  approveTokensTransferForDataProductPurchase(dataProductAddress: string): Observable<TransactionEvent> {
    const subject = new BehaviorSubject<TransactionEvent>(undefined);

    this.transactionService.handleTransaction(
      subject,
      BlockchainTransactionScope.DataProduct,
      dataProductAddress,
      ActionButtonType.ApproveBeforeBuy,
      async () => (await this.api).approveTokensTransferForDataProductPurchase(dataProductAddress)
    );

    return subject.asObservable();
  }

  purchaseDataProduct(dataProductAddress: string, buyerPublicKey: string): Observable<TransactionEvent> {
    const subject = new BehaviorSubject<TransactionEvent>(undefined);

    this.transactionService.handleTransaction(
      subject,
      BlockchainTransactionScope.DataProduct,
      dataProductAddress,
      ActionButtonType.Buy,
      async () => (await this.api).purchaseDataProduct(dataProductAddress, buyerPublicKey)
    );

    return subject.asObservable();
  }

  finaliseDataProductPurchase(orderAddress: string, dataProductAddress: string, buyerAddress: string, buyerMetaHash: string)
    : Observable<TransactionEvent> {
    const subject = new BehaviorSubject<TransactionEvent>(undefined);

    this.transactionService.handleTransaction(
      subject,
      BlockchainTransactionScope.DataProductOrder,
      orderAddress,
      ActionButtonType.Finalise,
      async () => (await this.api).finaliseDataProductPurchase(dataProductAddress, buyerAddress, buyerMetaHash)
    );

    return subject.asObservable();
  }

  rateDataProductPurchase(dataProductAddress: string, score: BigNumber): Observable<TransactionEvent> {
    const subject = new BehaviorSubject<TransactionEvent>(undefined);

    this.transactionService.handleTransaction(
      subject,
      BlockchainTransactionScope.DataProduct,
      dataProductAddress,
      ActionButtonType.Rate,
      async () => (await this.api).rateDataProductPurchase(dataProductAddress, score)
    );

    return subject.asObservable();
  }

  withdrawFundsFromDataProduct(dataProductAddress: string): Observable<TransactionEvent> {
    const subject = new BehaviorSubject<TransactionEvent>(undefined);

    this.transactionService.handleTransaction(
      subject,
      BlockchainTransactionScope.DataProduct,
      dataProductAddress,
      ActionButtonType.Withdraw,
      async () => (await this.api).withdrawFundsFromDataProduct(dataProductAddress)
    );

    return subject.asObservable();
  }

  disableDataProduct(dataProductAddress: string): Observable<TransactionEvent> {
    const subject = new BehaviorSubject<TransactionEvent>(undefined);

    this.transactionService.handleTransaction(
      subject,
      BlockchainTransactionScope.DataProduct,
      dataProductAddress,
      ActionButtonType.Unpublish,
      async () => (await this.api).disableDataProduct(dataProductAddress)
    );

    return subject.asObservable();
  }

  cancelDataProductPurchase(dataProductAddress: string): Observable<TransactionEvent> {
    const subject = new BehaviorSubject<TransactionEvent>(undefined);

    this.transactionService.handleTransaction(
      subject,
      BlockchainTransactionScope.DataProduct,
      dataProductAddress,
      ActionButtonType.CancelPurchase,
      async () => (await this.api).cancelDataProductPurchase(dataProductAddress)
    );

    return subject.asObservable();
  }

  watchForDataProductUpdate(_dataProductAddress?: string, _dataProductUpdateAction?: DataProductUpdateAction)
    : Observable<DataProductEvent> {
    if (!this.wallet) {
      return;
    }

    if (!this.websocketMessage$) {
      this.websocketMessage$ = this.websocketService.onEvent(WebsocketEvent.DataProductUpdate);
    }

    return this.websocketMessage$.pipe(
      map((data: any) => {
        return {
          dataProductAddress: data.args.dataProduct,
          blockNumber: data.blockNumber,
          action: parseInt(data.args.action, 10),
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
    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }
  }

  private onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
  }
}
