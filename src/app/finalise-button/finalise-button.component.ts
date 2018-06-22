import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DataProductTransaction } from '../data-product-transaction';
import { KeysGeneratorDialogComponent } from '../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeysPasswordDialogComponent } from '../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeyStoreService } from '../key-store/key-store.service';
import { Subscription } from 'rxjs';
import { FileReencryptionTask } from '../tasks/file-reencryption-task';
import { DataProduct } from '../data-product';
import { RepuxLibService } from '../services/repux-lib.service';
import { DataProductService } from '../services/data-product.service';
import { TaskManagerService } from '../services/task-manager.service';
import { DataProductNotificationsService } from '../services/data-product-notifications.service';
import Wallet from '../wallet';
import { WalletService } from '../services/wallet.service';

@Component({
  selector: 'app-finalise-button',
  templateUrl: './finalise-button.component.html',
  styleUrls: [ './finalise-button.component.scss' ]
})
export class FinaliseButtonComponent implements OnDestroy, OnInit {
  @Input() transaction: DataProductTransaction;
  @Input() dataProduct: DataProduct;

  public wallet: Wallet;
  public userIsOwner: boolean;

  private _subscription: Subscription;

  constructor(
    private _repuxLibService: RepuxLibService,
    private _dataProductService: DataProductService,
    private _keyStoreService: KeyStoreService,
    private _taskManagerService: TaskManagerService,
    private _dataProductNotificationsService: DataProductNotificationsService,
    private _walletService: WalletService,
    private _dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }

  getUserIsOwner(): boolean {
    return this.wallet.address === this.dataProduct.ownerAddress;
  }

  async finalise() {
    const { privateKey } = await this._getKeys();
    const publicKey = this._repuxLibService.getClass().deserializePublicKey(this.transaction.publicKey);

    const fileReencryptionTask = new FileReencryptionTask(
      this.dataProduct.address,
      this.transaction.buyerAddress,
      this.dataProduct.sellerMetaHash,
      privateKey,
      publicKey,
      this._repuxLibService,
      this._dataProductService,
      this._keyStoreService,
      this._dialog
    );

    this._taskManagerService.addTask(fileReencryptionTask);
    this.transaction.finalised = true;
    this._dataProductNotificationsService.removeFinalisationRequest({
      dataProductAddress: this.dataProduct.address,
      buyerAddress: this.transaction.buyerAddress
    });
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
