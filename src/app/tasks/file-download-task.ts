import { Task } from './task';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { BlobDownloader } from '../utils/blob-downloader';
import { TaskType } from './task-type';

export const STATUS = {
  DOWNLOADING: 'Downloading',
  FINISHED: 'Finished',
  CANCELED: 'Canceled'
};

export class FileDownloadTask implements Task {
  public readonly walletSpecific = false;
  public readonly taskType = TaskType.DOWNLOAD;
  private _downloader;
  private _result: string;
  private _taskManagerService: TaskManagerService;

  constructor(
    private _dataProductAddress: string,
    private _buyerAddress: string,
    private _metaFileHash: string,
    private _buyerPrivateKey: JsonWebKey,
    private _repuxLibService: RepuxLibService
  ) {
    this._name = `Downloading ${this._dataProductAddress}`;
    this._downloader = this._repuxLibService.getInstance().createFileDownloader();
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
    this._status = STATUS.DOWNLOADING;
    this._taskManagerService = taskManagerService;

    this._downloader.download(this._buyerPrivateKey, this._metaFileHash)
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
        this._finished = true;
        this._result = result;
        this._status = STATUS.FINISHED;
        new BlobDownloader().downloadBlob(result.fileURL, result.fileName);
      })
      .on('progress, error, finish', () => {
        this._taskManagerService.onTaskEvent();
      });
  }

  cancel(): void {
    this._downloader.terminate();
    this._finished = true;
    this._errors.push(STATUS.CANCELED);
    this._status = STATUS.CANCELED;
    this._taskManagerService.onTaskEvent();
  }

  async callUserAction(): Promise<any> {
    return;
  }
}
