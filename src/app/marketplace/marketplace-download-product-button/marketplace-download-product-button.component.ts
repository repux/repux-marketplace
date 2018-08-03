import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { DataProductService } from '../../services/data-product.service';
import { FileDownloadTask } from '../../tasks/file-download-task';
import Wallet from '../../shared/models/wallet';
import { RepuxLibService } from '../../services/repux-lib.service';
import { TaskManagerService } from '../../services/task-manager.service';
import { KeysPasswordDialogComponent } from '../../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeyStoreService } from '../../key-store/key-store.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MatDialog } from '@angular/material';
import { Task } from '../../tasks/task';
import { TaskType } from '../../tasks/task-type';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { DataProduct } from '../../shared/models/data-product';
import { CommonDialogService } from '../../shared/services/common-dialog.service';

@Component({
  selector: 'app-marketplace-download-product-button',
  templateUrl: './marketplace-download-product-button.component.html',
  styleUrls: [ './marketplace-download-product-button.component.scss' ]
})
export class MarketplaceDownloadProductButtonComponent implements OnDestroy, OnInit {
  @Input() dataProduct: DataProduct;
  private _walletSubscription: Subscription;
  private _tasksSubscription: Subscription;
  private _keyStoreSubscription: Subscription;
  private _wallet: Wallet;
  private _foundTask: Task;

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _repuxLibService: RepuxLibService,
    private _taskManagerService: TaskManagerService,
    private _keyStoreService: KeyStoreService,
    private _dialog: MatDialog,
    private _tagManager: TagManagerService,
    private commonDialogService: CommonDialogService
  ) {
  }

  get downloading() {
    return this.progress !== null;
  }

  get progress() {
    if (!this._foundTask) {
      return null;
    }

    return this._foundTask.progress;
  }

  cancel() {
    if (!this._foundTask) {
      return;
    }

    this._foundTask.cancel();
  }

  ngOnInit(): void {
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
    this._tasksSubscription = this._taskManagerService.getTasks().subscribe(tasks => this._onTasksChange(tasks));
  }

  async downloadProduct(): Promise<void> {
    this._tagManager.sendEvent(
      EventCategory.Buy,
      EventAction.Download,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    const { privateKey } = await this._getKeys();

    this._tagManager.sendEvent(
      EventCategory.Buy,
      EventAction.DownloadConfirmed,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    const product = await this._dataProductService.getDataProductData(this.dataProduct.address);
    let metaHash;

    if (product.owner === this._wallet.address) {
      metaHash = product.sellerMetaHash;
    } else {
      const order = await this._dataProductService.getOrderData(this.dataProduct.address, this._wallet.address);
      metaHash = order.buyerMetaHash;
    }

    const fileDownloadTask = new FileDownloadTask(
      this._wallet.address,
      this.dataProduct.address,
      this._wallet.address,
      metaHash,
      privateKey,
      this._repuxLibService,
      this.commonDialogService
    );

    this._taskManagerService.addTask(fileDownloadTask);
  }

  ngOnDestroy() {
    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }

    if (this._tasksSubscription) {
      this._tasksSubscription.unsubscribe();
    }

    if (this._keyStoreSubscription) {
      this._keyStoreSubscription.unsubscribe();
    }
  }

  private _onWalletChange(wallet: Wallet): void {
    if (!wallet || wallet === this._wallet) {
      return;
    }

    this._wallet = wallet;
  }

  private _onTasksChange(tasks: ReadonlyArray<Task>) {
    this._foundTask = tasks.find(task =>
      task.taskType === TaskType.DOWNLOAD &&
      task.productAddress === this.dataProduct.address &&
      !task.finished
    );
  }

  private _getKeys(): Promise<{ privateKey: JsonWebKey, publicKey: JsonWebKey }> {
    return new Promise(resolve => {
      let dialogRef;

      if (this._keyStoreService.hasKeys()) {
        dialogRef = this._dialog.open(KeysPasswordDialogComponent);
      } else {
        dialogRef = this._dialog.open(KeysGeneratorDialogComponent);
      }

      this._keyStoreSubscription = dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve({
            privateKey: result.privateKey,
            publicKey: result.publicKey
          });
        }
      });
    });
  }
}
