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

export const STATUS = {
  REENCRYPTION: 'Reencryption',
  WAITING_FOR_FINALISATION: 'Waiting for finalisation',
  FINISHED: 'Finished',
  CANCELED: 'Canceled',
  PENDING_FINALISATION: 'Pending finalisation',
  REJECTED: 'Transaction rejected, try again'
};

export class FileReencryptionTask implements Task {
  public readonly walletSpecific = true;
  public readonly taskType = TaskType.REENCRYPTION;
  private _subscription: Subscription;
  private _reencryptor;
  private _result: string;
  private _taskManagerService: TaskManagerService;

  constructor(
    private _dataProductAddress: string,
    private _buyerAddress: string,
    private _metaFileHash: string,
    private _sellerPrivateKey: JsonWebKey,
    private _buyerPublicKey: JsonWebKey,
    private _repuxLibService: RepuxLibService,
    private _dataProductService: DataProductService,
    private _keyStoreService: KeyStoreService,
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
      })
      .on('finish', (eventType, result) => {
        this._progress = 100;
        this._result = result;
        this._needsUserAction = true;
        this._userActionName = 'Finalise';
        this._status = STATUS.WAITING_FOR_FINALISATION;
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
  }

  async callUserAction(): Promise<any> {
    try {
      this._needsUserAction = false;
      this._status = STATUS.PENDING_FINALISATION;
      this._taskManagerService.onTaskEvent();
      await this._dataProductService.finaliseDataProductPurchase(this._dataProductAddress, this._buyerAddress, this._result);
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
