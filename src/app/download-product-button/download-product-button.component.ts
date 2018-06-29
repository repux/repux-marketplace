import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WalletService } from '../services/wallet.service';
import { DataProductService } from '../services/data-product.service';
import { FileDownloadTask } from '../tasks/file-download-task';
import Wallet from '../wallet';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { KeysPasswordDialogComponent } from '../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeyStoreService } from '../key-store/key-store.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MatDialog } from '@angular/material';
import { Task } from '../tasks/task';
import { TaskType } from '../tasks/task-type';

@Component({
  selector: 'app-download-product-button',
  templateUrl: './download-product-button.component.html',
  styleUrls: [ './download-product-button.component.scss' ]
})
export class DownloadProductButtonComponent implements OnDestroy, OnInit {
  @Input() productAddress: string;
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
    private _dialog: MatDialog
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
    const { privateKey } = await this._getKeys();
    const product = await this._dataProductService.getDataProductData(this.productAddress);
    let metaHash;

    if (product.owner === this._wallet.address) {
      metaHash = product.sellerMetaHash;
    } else {
      const transaction = await this._dataProductService.getTransactionData(this.productAddress, this._wallet.address);
      metaHash = transaction.buyerMetaHash;
    }

    const fileDownloadTask = new FileDownloadTask(
      this.productAddress,
      this._wallet.address,
      metaHash,
      privateKey,
      this._repuxLibService
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
      task.productAddress === this.productAddress &&
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
