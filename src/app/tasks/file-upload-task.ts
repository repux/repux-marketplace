import { Task } from './task';
import { BigNumber } from 'bignumber.js';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { DataProductService } from '../services/data-product.service';

export const STATUS = {
  UPLOADING: 'Uploading',
  WAITING_FOR_PUBLICATION: 'Waiting for publication',
  FINISHED: 'Finished',
  CANCELED: 'Canceled',
  PUBLICATION: 'Publication',
  PUBLICATION_REJECTED: 'Publication rejected, try again'
};

export class FileUploadTask implements Task {
  private _uploader;
  private _progress: number;
  private _result: string;
  private _errors: string[] = [];
  private _finished = false;
  private _name: string;
  private _needsUserAction: boolean;
  private _userActionName: string;
  private _status: string;
  private _taskManagerService: TaskManagerService;
  public readonly walletSpecific = false;

  constructor(
    private _publicKey: JsonWebKey,
    private _repuxLibService: RepuxLibService,
    private _dataProductService: DataProductService,
    private _title: string,
    private _shortDescription: string,
    private _longDescription: string,
    private _category: string[],
    private _price: BigNumber,
    private _file: File,
    private _daysForDeliver: number
  ) {
    this._name = `Creating ${this._file.name}`;
    this._uploader = this._repuxLibService.getInstance().createFileUploader();
  }

  run(taskManagerService: TaskManagerService): void {
    this._status = STATUS.UPLOADING;
    this._taskManagerService = taskManagerService;

    this._uploader.upload(this._publicKey, this._file, this._createMetadata())
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
        this._userActionName = 'Publish';
        this._status = STATUS.WAITING_FOR_PUBLICATION;
      })
      .on('progress, error, finish', () => {
        this._taskManagerService.onTaskEvent();
      });
  }

  cancel(): void {
    this._uploader.terminate();
    this._finished = true;
    this._errors.push(STATUS.CANCELED);
    this._status = STATUS.CANCELED;
    this._taskManagerService.onTaskEvent();
  }

  async callUserAction(): Promise<any> {
    if (!this._needsUserAction) {
      return;
    }

    try {
      this._needsUserAction = false;
      this._status = STATUS.PUBLICATION;
      this._taskManagerService.onTaskEvent();
      await this._dataProductService.publishDataProduct(this._result, this._price, this._daysForDeliver);
      this._status = STATUS.FINISHED;
      this._finished = true;
      this._taskManagerService.onTaskEvent();
    } catch (error) {
      console.warn(error);
      this._needsUserAction = true;
      this._status = STATUS.PUBLICATION_REJECTED;
      this._taskManagerService.onTaskEvent();
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

  _createMetadata() {
    return {
      title: this._title,
      shortDescription: this._shortDescription,
      longDescription: this._longDescription,
      category: this._category,
      price: this._price
    };
  }
}
