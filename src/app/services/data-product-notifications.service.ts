import { DataProductService } from './data-product.service';
import { DataProductUpdateAction } from 'repux-web3-api';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-type';
import { Notification } from '../notifications/notification';
import { Injectable, OnDestroy } from '@angular/core';
import { DataProductEvent } from 'repux-web3-api/repux-web3-api';
import { Subscription } from 'rxjs/internal/Subscription';
import { FileReencryptionTask } from '../tasks/file-reencryption-task';
import { RepuxLibService } from './repux-lib.service';
import { MatDialog } from '@angular/material';
import { KeyStoreService } from '../key-store/key-store.service';
import { TaskManagerService } from './task-manager.service';
import Wallet from '../wallet';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class DataProductNotificationsService implements OnDestroy {
  private _purchaseSubscriptions: Subscription[] = [];
  private _wallet: Wallet;

  constructor(
    private _notificationsService: NotificationsService,
    private _repuxLibService: RepuxLibService,
    private _dataProductService: DataProductService,
    private _keyStoreService: KeyStoreService,
    private _taskManagerService: TaskManagerService,
    private _walletService: WalletService,
    private _dialog: MatDialog
  ) {
    this._notificationsService.addParser(
      NotificationType.DATA_PRODUCT_TO_APPROVE,
      (notification: Notification) => this._parseDataProductToApprove(notification)
    );
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
    this._clearSubscriptions();
    this._init();
  }

  private async _init(): Promise<void> {
    const productsAddresses = await this._dataProductService.getCreatedDataProducts();
    productsAddresses.forEach(productAddress => {
      this.watchForProductPurchase(productAddress);
    });
  }

  watchForProductPurchase(productAddress: string): void {
    this._purchaseSubscriptions.push(
      this._dataProductService.watchForDataProductUpdate(productAddress, DataProductUpdateAction.PURCHASE)
        .subscribe(purchaseEvent => this._onProductPurchase(purchaseEvent))
    );
  }

  private async _onProductPurchase(purchaseEvent: DataProductEvent): Promise<void> {
    this._notificationsService.pushNotification(new Notification(
      NotificationType.DATA_PRODUCT_TO_APPROVE,
      {
        purchaseEvent
      })
    );
  }

  private async _parseDataProductToApprove(notification: Notification): Promise<string | null> {
    const purchaseEvent = notification.data.purchaseEvent;
    const transaction = await this._dataProductService.getTransactionData(purchaseEvent.dataProductAddress, purchaseEvent.userAddress);
    const notificationMessage = `User with account ${purchaseEvent.userAddress} purchased your product ` +
      `${purchaseEvent.dataProductAddress}. Please approve this transaction.`;

    if (transaction.approved) {
      notification.read = true;
      this._notificationsService.saveNotifications();
      return notificationMessage;
    }

    const publicKey = this._repuxLibService.getClass().deserializePublicKey(transaction.publicKey);
    const dataProduct = await this._dataProductService.getDataProductData(purchaseEvent.dataProductAddress);

    const fileReencryptionTask = new FileReencryptionTask(
      purchaseEvent.dataProductAddress,
      purchaseEvent.userAddress,
      dataProduct.sellerMetaHash,
      publicKey,
      this._repuxLibService,
      this._dataProductService,
      this._keyStoreService,
      this._dialog
    );

    this._taskManagerService.addTask(fileReencryptionTask);

    return notificationMessage;
  }

  private _clearSubscriptions() {
    if (this._purchaseSubscriptions.length) {
      this._purchaseSubscriptions.forEach(subscription => subscription.unsubscribe());
      this._purchaseSubscriptions = [];
    }
  }

  ngOnDestroy() {
    this._clearSubscriptions();
  }
}
