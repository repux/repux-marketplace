import { Task } from './task';
import { BigNumber } from 'bignumber.js';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { DataProductService } from '../services/data-product.service';
import { TaskType } from './task-type';
import { UnpublishedProductsService } from '../marketplace/services/unpublished-products.service';
import { DataProduct } from '../shared/models/data-product';
import { TransactionDialogComponent } from '../shared/components/transaction-dialog/transaction-dialog.component';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { FileUploader, EventType, FileMetaData, Attachment, Eula, PurchaseType } from 'repux-lib';
import { EventAction, EventCategory, TagManagerService } from '../shared/services/tag-manager.service';
import { IpfsService } from '../services/ipfs.service';
import { EulaSelection } from '../marketplace/marketplace-eula-selector/marketplace-eula-selector.component';

export const STATUS = {
  UPLOADING: 'Uploading',
  WAITING_FOR_PUBLICATION: 'Waiting for publication',
  FINISHED: 'Finished',
  CANCELED: 'Canceled',
  PUBLICATION: 'Publication',
  PUBLICATION_REJECTED: 'Publication rejected'
};

export class FileUploadTask implements Task {
  public readonly walletSpecific = false;
  public readonly taskType = TaskType.UPLOAD;
  private _uploader: FileUploader;
  private _result: string;
  private _taskManagerService: TaskManagerService;
  private _dataProduct: DataProduct;
  private _transactionDialogSubscription: Subscription;
  private _sampleFile?: Attachment[];
  private _eula?: Eula;

  constructor(
    private _publicKey: JsonWebKey,
    private _title: string,
    private _shortDescription: string,
    private _fullDescription: string,
    private _category: string[],
    private _price: BigNumber,
    private _file: File,
    private _daysToDeliver: number,
    private _sampleFiles: FileList,
    private _eulaSelection: EulaSelection,
    private _maxNumberOfDownloads: number,
    private _purchaseType: PurchaseType,
    private _dialog: MatDialog,
    private _repuxLibService: RepuxLibService,
    private _dataProductService: DataProductService,
    private _unpublishedProductsService: UnpublishedProductsService,
    private _ipfsService: IpfsService,
    private _tagManager: TagManagerService
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

  async run(taskManagerService: TaskManagerService): Promise<void> {
    this._status = STATUS.UPLOADING;
    this._taskManagerService = taskManagerService;

    this._eula = await this.uploadEula(this._eulaSelection);
    this._sampleFile = await this.uploadSampleFiles(this._sampleFiles);

    this._uploader.upload(this._publicKey, this._file, this.createMetadata())
      .on(EventType.PROGRESS, (eventType, progress) => {
        this._progress = progress * 100;
      })
      .on(EventType.ERROR, (eventType, error) => {
        this._finished = true;
        this._errors.push(error);
        this._status = STATUS.CANCELED;
        this.destroy();
      })
      .on(EventType.FINISH, (eventType, result) => {
        this._progress = 100;
        this._result = result;
        this._needsUserAction = true;
        this._userActionName = 'Publish';
        this._status = STATUS.WAITING_FOR_PUBLICATION;
        this._saveProduct();
      })
      .on([ EventType.PROGRESS, EventType.ERROR, EventType.FINISH ], () => {
        this._taskManagerService.onTaskEvent();
      });
  }

  cancel(): void {
    this._uploader.terminate();
    this._finished = true;
    this._errors.push(STATUS.CANCELED);
    this._status = STATUS.CANCELED;
    this._taskManagerService.onTaskEvent();
    this.destroy();
  }

  destroy() {
    this._unsubscribeTransactionDialog();
  }

  async callUserAction(): Promise<any> {
    if (!this._needsUserAction) {
      return;
    }

    this._tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.PublishButton,
      this._title,
      this._price ? this._price.toString() : ''
    );

    this._needsUserAction = false;
    this._status = STATUS.PUBLICATION;
    this._taskManagerService.onTaskEvent();

    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });

    this._unsubscribeTransactionDialog();
    this._transactionDialogSubscription = transactionDialogRef.afterClosed().subscribe(result => {
      this._finished = true;

      if (result) {
        this._unpublishedProductsService.removeProduct(this._dataProduct);
        this._status = STATUS.FINISHED;

        this._tagManager.sendEvent(
          EventCategory.Sell,
          EventAction.PublishButtonConfirmed,
          this._title,
          this._price ? this._price.toString() : ''
        );
      } else {
        this._errors.push(STATUS.PUBLICATION_REJECTED);
        this._status = STATUS.PUBLICATION_REJECTED;
      }

      this._taskManagerService.onTaskEvent();
      this.destroy();
    });

    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.publishDataProduct(this._result, this._price, this._daysToDeliver);

    return transactionDialog.callTransaction();
  }

  async uploadSampleFiles(sampleFiles?: FileList): Promise<Attachment[]> {
    const result: Attachment[] = [];

    if (!sampleFiles) {
      return;
    }

    for (const file of Array.from(sampleFiles)) {
      const { hash } = await this._ipfsService.uploadFile(file);
      result.push({
        fileName: file.name,
        title: file.name,
        fileHash: hash
      });
    }

    return result;
  }

  async uploadEula(eulaSelection: EulaSelection): Promise<Eula> {
    const { hash } = await this._ipfsService.uploadFile(eulaSelection.file);

    return {
      fileName: eulaSelection.file.name,
      type: eulaSelection.type,
      fileHash: hash
    };
  }

  createMetadata(): FileMetaData {
    return {
      title: this._title,
      shortDescription: this._shortDescription,
      fullDescription: this._fullDescription,
      category: this._category,
      price: this._price,
      sampleFile: this._sampleFile,
      eula: this._eula,
      maxNumberOfDownloads: this._maxNumberOfDownloads,
      type: this._purchaseType
    };
  }

  private _unsubscribeTransactionDialog() {
    if (this._transactionDialogSubscription) {
      this._transactionDialogSubscription.unsubscribe();
      this._transactionDialogSubscription = null;
    }
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
    dataProduct.daysToDeliver = this._daysToDeliver;
    dataProduct.eula = this._eula;
    dataProduct.sampleFile = this._sampleFile;
    this._dataProduct = dataProduct;

    this._unpublishedProductsService.addProduct(this._dataProduct);
  }
}
