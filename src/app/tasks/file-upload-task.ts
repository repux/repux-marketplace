import { Task } from "./task";
import { BigNumber } from "bignumber.js";
import { RepuxLibService } from "../repux-lib.service";
import { TaskManagerService } from "../task-manager/task-manager.service";
import { DataProductService } from "../data-product.service";

export const STATUS = {
  UPLOADING: 'Uploading',
  WAITING_FOR_PUBLICATION: 'Waiting for publication',
  FINISHED: 'Finished',
  CANCELED: 'Canceled',
  PUBLICATION: 'Publication',
  PUBLICATION_REJECTED: 'Publication rejected, try again'
};

export class FileUploadTask implements Task {
  private uploader;
  private _progress: number;
  private _result: string;
  private _errors: string[] = [];
  private _finished: boolean = false;
  private _name: string;
  private _needsUserAction: boolean;
  private _userActionName: string;
  private _status: string;
  private _taskManagerService: TaskManagerService;

  constructor(
    public publicKey: CryptoKey,
    public repuxService: RepuxLibService,
    public dataProductService: DataProductService,
    public title: string,
    public shortDescription: string,
    public longDescription: string,
    public category: string[],
    public price: BigNumber,
    public file: File
  ) {
    this._name = this.file.name;
    this.uploader = this.repuxService.getInstance().createFileUploader();
  }

  run(taskManagerService: TaskManagerService): void {
    this._status = STATUS.UPLOADING;

    this._taskManagerService = taskManagerService;

    const metaData = {
      title: this.title,
      shortDescription: this.shortDescription,
      longDescription: this.longDescription,
      category: this.category,
      price: this.price
    };

    this.uploader.upload(this.publicKey, this.file, metaData)
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
    this.uploader.terminate();
    this._finished = true;
    this._errors.push(STATUS.CANCELED);
    this._status = STATUS.CANCELED;
    this._taskManagerService.onTaskEvent();
  }

  async callUserAction(): Promise<any> {
    if (!this.needsUserAction) {
      return
    }
    this._needsUserAction = false;

    try {
      this._status = STATUS.PUBLICATION;
      this._taskManagerService.onTaskEvent();
      await this.dataProductService.publishDataProduct(this._result, this.price);
      this._status = STATUS.FINISHED;
      this._finished = true;
      this._taskManagerService.onTaskEvent();
    } catch (error) {
      this._needsUserAction = true;
      this._status = STATUS.PUBLICATION_REJECTED;
      this._taskManagerService.onTaskEvent();
    }
  }

  get progress(): number {
    return this._progress;
  }

  get errors(): string[] {
    return this._errors;
  }

  get finished(): boolean{
    return this._finished;
  }

  get name(): string{
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
