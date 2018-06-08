import { Task } from './task';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { BlobDownloader } from '../utils/blob-downloader';

export const STATUS = {
  DOWNLOADING: 'Downloading',
  FINISHED: 'Finished',
  CANCELED: 'Canceled'
};

export class FileDownloadTask implements Task {
  private _downloader;
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
    private _buyerPrivateKey: JsonWebKey,
    private _repuxLibService: RepuxLibService
  ) {
    this._name = `Downloading ${this._dataProductAddress}`;
    this._downloader = this._repuxLibService.getInstance().createFileDownloader();
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
}
