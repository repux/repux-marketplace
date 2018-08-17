import { Task } from './task';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { BlobDownloader } from '../shared/utils/blob-downloader';
import { TaskType } from './task-type';
import { EventType, FileDownloader } from 'repux-lib';
import { TaskError } from './task-error';
import { CommonDialogService } from '../shared/services/common-dialog.service';

export const STATUS = {
  DOWNLOADING: 'Downloading',
  FINISHED: 'Finished',
  CANCELED: 'Canceled'
};

export class FileDownloadTask implements Task {
  public readonly taskType = TaskType.DOWNLOAD;
  private _downloader: FileDownloader;
  private _result: string;
  private _taskManagerService: TaskManagerService;
  private _progress: number;
  private _errors: string[] = [];
  private _finished = false;
  private _name: string;
  private _status: string;

  constructor(
    public readonly walletAddress: string,
    private _dataProductAddress: string,
    private _buyerAddress: string,
    private _metaFileHash: string,
    private _buyerPrivateKey: JsonWebKey,
    private fileName: string,
    private _repuxLibService: RepuxLibService,
    private commonDialogService: CommonDialogService
  ) {
    this._name = `Downloading ${this.fileName}`;
    this._downloader = this._repuxLibService.getInstance().createFileDownloader();
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
      .on(EventType.PROGRESS, (eventType, progress) => {
        this._progress = progress * 100;
      })
      .on(EventType.ERROR, (eventType, error) => {
        this._finished = true;
        this._errors.push(error);
        this._status = STATUS.CANCELED;

        if (error === TaskError.DecryptionError) {
          this.displayDecryptionErrorMessage();
        }
      })
      .on(EventType.FINISH, (eventType, result) => {
        this._progress = 100;
        this._finished = true;
        this._result = result;
        this._status = STATUS.FINISHED;
        new BlobDownloader().downloadBlob(result.fileURL, result.fileName);
      })
      .on([ EventType.PROGRESS, EventType.ERROR, EventType.FINISH ], () => {
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

  displayDecryptionErrorMessage() {
    this.commonDialogService.alert(
      'You can not decrypt the file. Please upload the key pair that was used during buy transaction.',
      'Decryption error'
    );
  }
}
