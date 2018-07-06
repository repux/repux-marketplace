import { Task } from './task';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { DataProductService } from '../services/data-product.service';
import { KeysPasswordDialogComponent } from '../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeyStoreService } from '../key-store/key-store.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { TaskType } from './task-type';
import { PendingFinalisationService } from '../services/data-product-notifications/pending-finalisation.service';
import { TransactionDialogComponent } from '../shared/components/transaction-dialog/transaction-dialog.component';
import { AsyncSubject } from 'rxjs/internal/AsyncSubject';

export const STATUS = {
  REENCRYPTION: 'Reencryption',
  FINISHED: 'Finished',
  CANCELED: 'Canceled',
  PENDING_FINALISATION: 'Pending finalisation',
  REJECTED: 'Transaction rejected'
};

export class FileReencryptionTask implements Task {
  public readonly walletSpecific = true;
  public readonly taskType = TaskType.REENCRYPTION;
  private _subscription: Subscription;
  private _reencryptor;
  private _result: string;
  private _taskManagerService: TaskManagerService;
  private _finishSubject = new AsyncSubject();
  private _transactionDialogSubscription: Subscription;

  constructor(
    private _dataProductAddress: string,
    private _buyerAddress: string,
    private _metaFileHash: string,
    private _sellerPrivateKey: JsonWebKey,
    private _buyerPublicKey: JsonWebKey,
    private _repuxLibService: RepuxLibService,
    private _dataProductService: DataProductService,
    private _keyStoreService: KeyStoreService,
    private _pendingFinalisationService: PendingFinalisationService,
    private _dialog: MatDialog
  ) {
    this._name = `Selling ${this._dataProductAddress}`;
    this._reencryptor = this._repuxLibService.getInstance().createFileReencryptor();
  }

  private _progress: number;

  get progress(): number {
    return this._progress;
  }

  private _errors: string[] = [];

  get errors(): ReadonlyArray<string> {
    return Object.freeze(Object.assign([], this._errors));
  }

  private _finished = false;

  get finished(): boolean {
    return this._finished;
  }

  private _name: string;

  get name(): string {
    return this._name;
  }

  private _needsUserAction: boolean;

  get needsUserAction(): boolean {
    return this._needsUserAction;
  }

  private _userActionName: string;

  get userActionName(): string {
    return this._userActionName;
  }

  private _status: string;

  get status(): string {
    return this._status;
  }

  get productAddress(): string {
    return this._dataProductAddress;
  }

  run(taskManagerService: TaskManagerService): void {
    this._status = STATUS.REENCRYPTION;
    this._taskManagerService = taskManagerService;

    this._reencryptor.reencrypt(this._sellerPrivateKey, this._buyerPublicKey, this._metaFileHash)
      .on('progress', (eventType, progress) => {
        this._progress = progress * 100;
      })
      .on('error', (eventType, error) => {
        this._finished = true;
        this._errors.push(error);
        this._status = STATUS.CANCELED;
        this._emitFinish(false);
        this.destroy();
      })
      .on('finish', (eventType, result) => {
        this._progress = 100;
        this._result = result;
        this._finalise();
      })
      .on('progress, error, finish', () => {
        this._taskManagerService.onTaskEvent();
      });
  }

  cancel(): void {
    this._reencryptor.terminate();
    this._finished = true;
    this._errors.push(STATUS.CANCELED);
    this._status = STATUS.CANCELED;
    this._taskManagerService.onTaskEvent();
    this._emitFinish(false);
    this.destroy();
  }

  onFinish() {
    return this._finishSubject.asObservable();
  }

  destroy() {
    this._unsubscribeTransactionDialog();

    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }

  async callUserAction(): Promise<any> {
    return;
  }

  private _emitFinish(value): void {
    this._finishSubject.next(value);
    this._finishSubject.complete();
  }

  private async _finalise(): Promise<any> {
    this._status = STATUS.PENDING_FINALISATION;
    this._taskManagerService.onTaskEvent();

    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });

    this._unsubscribeTransactionDialog();
    this._transactionDialogSubscription = transactionDialogRef.afterClosed().subscribe(result => {
      this._finished = true;

      if (result) {
        this._status = STATUS.FINISHED;
        this._pendingFinalisationService.remove({
          dataProductAddress: this._dataProductAddress,
          buyerAddress: this._buyerAddress
        });
      } else {
        this._errors.push(STATUS.REJECTED);
        this._status = STATUS.REJECTED;
      }

      this._taskManagerService.onTaskEvent();
      this._emitFinish(result);
      this.destroy();
    });

    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.finaliseDataProductPurchase(
      this._dataProductAddress,
      this._buyerAddress,
      this._result
    );

    return transactionDialog.callTransaction();
  }

  private _unsubscribeTransactionDialog() {
    if (this._transactionDialogSubscription) {
      this._transactionDialogSubscription.unsubscribe();
      this._transactionDialogSubscription = null;
    }
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
}
