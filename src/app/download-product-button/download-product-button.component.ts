import { Component, Input, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-download-product-button',
  templateUrl: './download-product-button.component.html',
  styleUrls: [ './download-product-button.component.scss' ]
})
export class DownloadProductButtonComponent implements OnDestroy {
  @Input() productAddress: string;
  private _subscription: Subscription;

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _repuxLibService: RepuxLibService,
    private _taskManagerService: TaskManagerService,
    private _keyStoreService: KeyStoreService,
    private _dialog: MatDialog
  ) {}

  async downloadProduct(): Promise<void> {
    const { privateKey } = await this._getKeys();
    const wallet: Wallet = await this._walletService.getData();
    const product = await this._dataProductService.getDataProductData(this.productAddress);
    let metaHash;

    if (product.owner === wallet.address) {
      metaHash = product.sellerMetaHash;
    } else {
      const transaction = await this._dataProductService.getTransactionData(this.productAddress, wallet.address);
      metaHash = transaction.buyerMetaHash;
    }

    const fileDownloadTask = new FileDownloadTask(
      this.productAddress,
      wallet.address,
      metaHash,
      privateKey,
      this._repuxLibService
    );

    this._taskManagerService.addTask(fileDownloadTask);
  }

  private _getKeys(): Promise<{ privateKey: JsonWebKey, publicKey: JsonWebKey }> {
    return new Promise(resolve => {
      let dialogRef;

      if (this._keyStoreService.hasKeys()) {
        dialogRef = this._dialog.open(KeysPasswordDialogComponent);
      } else {
        dialogRef = this._dialog.open(KeysGeneratorDialogComponent);
      }

      this._subscription = dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve({
            privateKey: result.privateKey,
            publicKey: result.publicKey
          });
        }
      });
    });
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
