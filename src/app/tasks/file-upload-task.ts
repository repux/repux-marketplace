import { Task } from './task';
import { BigNumber } from 'bignumber.js';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { DataProductService } from '../services/data-product.service';
import { TaskType } from './task-type';
import { UnpublishedProductsService } from '../marketplace/services/unpublished-products.service';
import { DataProduct } from '../shared/models/data-product';
import { MatDialog } from '@angular/material';
import { Attachment, Eula, EventType, FileMetaData, FileUploader, PurchaseType } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { EulaSelection } from '../marketplace/marketplace-eula-selector/marketplace-eula-selector.component';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { Transaction, TransactionService } from '../shared/services/transaction.service';
import { BlockchainTransactionScope } from '../shared/enums/blockchain-transaction-scope';
import { Subscription } from 'rxjs';

export const STATUS = {
  UPLOADING: 'Uploading',
  WAITING_FOR_PUBLICATION: 'Waiting for publication',
  FINISHED: 'Finished',
  CANCELED: 'Canceled',
  PUBLICATION: 'Publication',
  PUBLICATION_REJECTED: 'Publication rejected'
};

export class FileUploadTask implements Task {
  public readonly taskType = TaskType.UPLOAD;
  public readonly needsUserAction = false;
  public readonly userActionName = '';

  private _uploader: FileUploader;
  private _result: string;
  private _taskManagerService: TaskManagerService;
  private _dataProduct: DataProduct;
  private _sampleFile?: Attachment[];
  private _eula?: Eula;
  private _progress: number;
  private _errors: string[] = [];
  private _finished = false;
  private _name: string;
  private _actionButton: ActionButtonType;
  private _status: string;
  private pendingTransaction: Transaction;
  private transactionsSubscription: Subscription;

  constructor(
    public readonly walletAddress: string,
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
    private transactionService: TransactionService
  ) {
    this._name = `Uploading ${this._file.name}`;
    this._uploader = this._repuxLibService.getInstance().createFileUploader();

    this.transactionsSubscription = this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
  }

  get dataProduct(): DataProduct {
    return this._dataProduct;
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

  get actionButton(): ActionButtonType {
    return this._actionButton;
  }

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
      })
      .on(EventType.FINISH, (eventType, result) => {
        this._progress = 100;
        this._result = result;
        this._actionButton = ActionButtonType.Publish;
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
    this.destroy();
    this._taskManagerService.onTaskEvent();
  }

  onTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      this._finished = true;
      this._status = STATUS.FINISHED;
      this.destroy();
    }

    delete this.pendingTransaction;
  }

  async onTransactionsListChange(transactions: Transaction[]) {
    const foundTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this.dataProduct.sellerMetaHash &&
      transaction.blocksAction === ActionButtonType.Publish
    );

    if (this.pendingTransaction && !foundTransaction) {
      this.onTransactionFinish(
        await this.transactionService.getTransactionReceipt(this.pendingTransaction.transactionHash)
      );
    } else {
      this.pendingTransaction = foundTransaction;
    }
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

  destroy() {
    this.transactionsSubscription.unsubscribe();
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

    this._unpublishedProductsService.addProduct(this._dataProduct, this.walletAddress);
  }
}
