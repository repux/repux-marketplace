import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DataProductTransaction } from '../../shared/models/data-product-transaction';
import { KeysGeneratorDialogComponent } from '../../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeysPasswordDialogComponent } from '../../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeyStoreService } from '../../key-store/key-store.service';
import { Subscription } from 'rxjs';
import { FileReencryptionTask } from '../../tasks/file-reencryption-task';
import { DataProduct } from '../../shared/models/data-product';
import { RepuxLibService } from '../../services/repux-lib.service';
import { DataProductService } from '../../services/data-product.service';
import { TaskManagerService } from '../../services/task-manager.service';
import Wallet from '../../shared/models/wallet';
import { WalletService } from '../../services/wallet.service';
import { PendingFinalisationService } from '../services/pending-finalisation.service';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';

@Component({
  selector: 'app-marketplace-finalise-button',
  templateUrl: './marketplace-finalise-button.component.html',
  styleUrls: [ './marketplace-finalise-button.component.scss' ]
})
export class MarketplaceFinaliseButtonComponent implements OnDestroy, OnInit {
  @Input() transaction: DataProductTransaction;
  @Input() dataProduct: DataProduct;
  @Output() success = new EventEmitter<DataProductTransaction>();

  public wallet: Wallet;
  public userIsOwner: boolean;
  public FileReencryptionTaskClass = FileReencryptionTask;

  private _keysSubscription: Subscription;
  private _walletSubscription: Subscription;
  private _reencryptionSubscription: Subscription;

  constructor(
    private _repuxLibService: RepuxLibService,
    private _dataProductService: DataProductService,
    private _keyStoreService: KeyStoreService,
    private _taskManagerService: TaskManagerService,
    private _pendingFinalisationService: PendingFinalisationService,
    private _walletService: WalletService,
    private _dialog: MatDialog,
    private _tagManager: TagManagerService,
    private commonDialogService: CommonDialogService
  ) {
  }

  ngOnInit() {
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  getUserIsOwner(): boolean {
    return this.wallet.address === this.dataProduct.ownerAddress;
  }

  async finalise() {
    this._tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.FinalizeTransaction,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    const { privateKey } = await this._getKeys();
    const publicKey = this._repuxLibService.getInstance().deserializePublicKey(this.transaction.publicKey);

    const fileReencryptionTask = new this.FileReencryptionTaskClass(
      this.dataProduct.address,
      this.transaction.buyerAddress,
      this.dataProduct.sellerMetaHash,
      privateKey,
      publicKey,
      this._repuxLibService,
      this._dataProductService,
      this._keyStoreService,
      this._pendingFinalisationService,
      this._dialog,
      this.commonDialogService
    );

    return new Promise(resolve => {
      this._reencryptionSubscription = fileReencryptionTask.onFinish().subscribe(result => {
        if (result) {
          this.transaction.finalised = true;
          this.success.emit(this.transaction);

          this._tagManager.sendEvent(
            EventCategory.Sell,
            EventAction.FinalizeTransactionConfirmed,
            this.dataProduct.title,
            this.dataProduct.price ? this.dataProduct.price.toString() : ''
          );
        }

        this._reencryptionSubscription.unsubscribe();
        resolve();
      });

      this._taskManagerService.addTask(fileReencryptionTask);
    });
  }

  ngOnDestroy() {
    if (this._keysSubscription) {
      this._keysSubscription.unsubscribe();
    }

    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }

    if (this._reencryptionSubscription) {
      this._reencryptionSubscription.unsubscribe();
    }
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }

  private _getKeys(): Promise<{ privateKey: JsonWebKey, publicKey: JsonWebKey }> {
    return new Promise(resolve => {
      let dialogRef;

      if (this._keyStoreService.hasKeys()) {
        dialogRef = this._dialog.open(KeysPasswordDialogComponent);
      } else {
        dialogRef = this._dialog.open(KeysGeneratorDialogComponent);
      }

      this._keysSubscription = dialogRef.afterClosed().subscribe(result => {
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
