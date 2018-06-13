import { Task } from './task';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { DataProductService } from '../services/data-product.service';
import { KeysPasswordDialogComponent } from '../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeyStoreService } from '../key-store/key-store.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';

export const STATUS = {
  WAITING_FOR_KEY_ACCESS: 'Waiting for key access',
  REENCRYPTION: 'Reencryption',
  WAITING_FOR_APPROVE: 'Waiting for approve',
  FINISHED: 'Finished',
  CANCELED: 'Canceled',
  PENDING_APPROVAL: 'Pending approval',
  REJECTED: 'Transaction rejected, try again'
};

export class FileReencryptionTask implements Task {
  private _subscription: Subscription;
  private _reencryptor;
  private _progress: number;
  private _result: string;
  private _errors: string[] = [];
  private _finished = false;
  private _name: string;
  private _needsUserAction: boolean;
  private _userActionName: string;
  private _status: string;
  private _taskManagerService: TaskManagerService;

  constructor(
    private _dataProductAddress: string,
    private _buyerAddress: string,
    private _metaFileHash: string,
    private _buyerPublicKey: JsonWebKey,
    private _repuxLibService: RepuxLibService,
    private _dataProductService: DataProductService,
    private _keyStoreService: KeyStoreService,
    private _dialog: MatDialog
  ) {
    this._name = `Selling ${this._dataProductAddress}`;
    this._reencryptor = this._repuxLibService.getInstance().createFileReencryptor();
  }

  run(taskManagerService: TaskManagerService): void {
    this._status = STATUS.WAITING_FOR_KEY_ACCESS;
    this._needsUserAction = true;
    this._userActionName = 'Give access';
    this._taskManagerService = taskManagerService;
  }

  cancel(): void {
    this._reencryptor.terminate();
    this._finished = true;
    this._errors.push(STATUS.CANCELED);
    this._status = STATUS.CANCELED;
    this._taskManagerService.onTaskEvent();
  }

  async callUserAction(): Promise<any> {
    if (!this._needsUserAction) {
      return;
    }

    if (this._status === STATUS.WAITING_FOR_KEY_ACCESS) {
      const { privateKey } = await this._getKeys();

      this._reencryptor.reencrypt(privateKey, this._buyerPublicKey, this._metaFileHash)
        .on('progress', (eventType, progress) => {
          this._progress = progress * 100;
        })
        .on('error', (eventType, error) => {
          this._finished = true;
          this._errors.push(error);
          this._status = STATUS.CANCELED;
        })
        .on('finish', (eventType, result) => {
          this._progress = 100;
          this._result = result;
          this._needsUserAction = true;
          this._userActionName = 'Approve';
          this._status = STATUS.WAITING_FOR_APPROVE;
        })
        .on('progress, error, finish', () => {
          this._taskManagerService.onTaskEvent();
        });
    } else {
      try {
        this._needsUserAction = false;
        this._status = STATUS.PENDING_APPROVAL;
        this._taskManagerService.onTaskEvent();
        await this._dataProductService.approveDataProductPurchase(this._dataProductAddress, this._buyerAddress, this._result);
        this._status = STATUS.FINISHED;
        this._finished = true;
        this._taskManagerService.onTaskEvent();
      } catch (error) {
        console.warn(error);
        this._needsUserAction = true;
        this._status = STATUS.REJECTED;
        this._taskManagerService.onTaskEvent();
      }
    }
  }

  get progress(): number {
    return this._progress;
  }

  get errors(): ReadonlyArray<string> {
    return Object.freeze(Object.assign([], this._errors));
  }

  get finished(): boolean {
    return this._finished;
  }

  get name(): string {
    return this._name;
  }

  get needsUserAction(): boolean {
    return this._needsUserAction;
  }

  get userActionName(): string {
    return this._userActionName;
  }

  get status(): string {
    return this._status;
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
