import { Task } from './task';
import { BigNumber } from 'bignumber.js';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { DataProductService } from '../services/data-product.service';
import { TaskType } from './task-type';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { DataProduct } from '../data-product';

export const STATUS = {
  UPLOADING: 'Uploading',
  WAITING_FOR_PUBLICATION: 'Waiting for publication',
  FINISHED: 'Finished',
  CANCELED: 'Canceled',
  PUBLICATION: 'Publication',
  PUBLICATION_REJECTED: 'Publication rejected, try again'
};

export class FileUploadTask implements Task {
  public readonly walletSpecific = false;
  public readonly taskType = TaskType.UPLOAD;
  private _uploader;
  private _result: string;
  private _taskManagerService: TaskManagerService;
  private _dataProduct: DataProduct;

  constructor(
    private _publicKey: JsonWebKey,
    private _repuxLibService: RepuxLibService,
    private _dataProductService: DataProductService,
    private _unpublishedProductsService: UnpublishedProductsService,
    private _title: string,
    private _shortDescription: string,
    private _fullDescription: string,
    private _category: string[],
    private _price: BigNumber,
    private _file: File,
    private _daysForDeliver: number
  ) {
    this._name = `Creating ${this._file.name}`;
    this._uploader = this._repuxLibService.getInstance().createFileUploader();
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
    return;
  }

  get sellerMetaHash(): string {
    return this._result;
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
        this._saveProduct();
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
      this._unpublishedProductsService.removeProduct(this._dataProduct);
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

  _createMetadata() {
    return {
      title: this._title,
      shortDescription: this._shortDescription,
      fullDescription: this._fullDescription,
      category: this._category,
      price: this._price
    };
  }

  private _saveProduct() {
    const dataProduct = new DataProduct();
    dataProduct.sellerMetaHash = this._result;
    dataProduct.name = this._file.name;
    dataProduct.size = this._file.size;
    dataProduct.title = this._title;
    dataProduct.shortDescription = this._shortDescription;
    dataProduct.fullDescription = this._fullDescription;
    dataProduct.category = this._category;
    dataProduct.price = this._price;
    dataProduct.daysForDeliver = this._daysForDeliver;
    this._dataProduct = dataProduct;

    this._unpublishedProductsService.addProduct(this._dataProduct);
  }
}
