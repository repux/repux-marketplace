import { Task } from './task';
import { TaskManagerService } from '../services/task-manager.service';
import { TaskType } from './task-type';
import { CommonDialogService } from '../shared/services/common-dialog.service';
import { DataProduct } from '../shared/models/data-product';
import { Transaction, TransactionService } from '../shared/services/transaction.service';
import { BlockchainTransactionScope } from '../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { TransactionReceipt, TransactionStatus } from '@repux/repux-web3-api';
// tslint:disable-next-line:max-line-length
import { MarketplacePurchaseConfirmationDialogComponent } from '../marketplace/marketplace-purchase-confirmation-dialog/marketplace-purchase-confirmation-dialog.component';
import { AwaitingFinalisationService } from '../marketplace/services/awaiting-finalisation.service';
import { MatDialog } from '@angular/material';
import { KeyStoreDialogService } from '../key-store/key-store-dialog.service';
import { RepuxLibService } from '../services/repux-lib.service';
import { DataProductService } from '../services/data-product.service';
import { EventAction, EventCategory, TagManagerService } from '../shared/services/tag-manager.service';
import { environment } from '../../environments/environment';
import { TransactionEventType } from '../shared/enums/transaction-event-type';
import { WalletService } from '../services/wallet.service';

export const STATUS = {
  APPROVING: 'Approving token transfer',
  APPROVING_TRANSACTION: 'Pending transaction (approve) ...',
  PURCHASING: 'Purchasing product',
  PURCHASING_TRANSACTION: 'Pending transaction (purchase) ...',
  FINISHED: 'Finished',
  CANCELED: 'Canceled'
};

export class FileBuyTask implements Task {
  public readonly taskType = TaskType.BUY;
  private _taskManagerService: TaskManagerService;
  private _progress: number;
  private _errors: string[] = [];
  private _finished = false;
  private _name: string;
  private _status: string;
  private pendingApproveTransaction: Transaction;
  private pendingTransaction: Transaction;

  constructor(
    public readonly walletAddress: string,
    private _dataProduct: DataProduct,
    private commonDialogService: CommonDialogService,
    private transactionService: TransactionService,
    private awaitingFinalisationService: AwaitingFinalisationService,
    private keyStoreDialogServiceSpy: KeyStoreDialogService,
    private repuxLibService: RepuxLibService,
    private dataProductService: DataProductService,
    private tagManagerService: TagManagerService,
    private walletService: WalletService,
    private dialog: MatDialog
  ) {
    this._name = `Buying ${this._dataProduct.name}`;
    this._status = STATUS.APPROVING;

    this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
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
    return this._dataProduct.address;
  }

  async run(taskManagerService: TaskManagerService): Promise<void> {
    this._taskManagerService = taskManagerService;

    const isApproved = await this.dataProductService.isTokensTransferForDataProductPurchaseApproved(this._dataProduct.address);

    if (isApproved) {
      this.onApproveTransactionFinish(<TransactionReceipt> { status: TransactionStatus.SUCCESSFUL });
      return;
    }

    const transaction = await this.commonDialogService.transaction(
      () => this.dataProductService.approveTokensTransferForDataProductPurchase(this._dataProduct.address)
    );

    transaction.subscribe(transactionEvent => {
      if (transactionEvent.type === TransactionEventType.Confirmed) {
        this._status = STATUS.APPROVING_TRANSACTION;
        return;
      }

      if (transactionEvent.type === TransactionEventType.Rejected ||
        transactionEvent.type === TransactionEventType.Dropped) {
        this._errors.push(transactionEvent.error.message);
        this.cancel();
      }
    });
  }

  cancel(): void {
    this._finished = true;
    this._status = STATUS.CANCELED;
    this._taskManagerService.onTaskEvent();
  }

  async onTransactionsListChange(transactions: Transaction[]) {
    if (this._finished) {
      return;
    }

    const foundApproveTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this._dataProduct.address &&
      transaction.blocksAction === ActionButtonType.ApproveBeforeBuy
    );

    if (this.pendingApproveTransaction && !foundApproveTransaction) {
      this.onApproveTransactionFinish(
        await this.transactionService.getTransactionReceipt(this.pendingApproveTransaction.transactionHash)
      );
    } else {
      this.pendingApproveTransaction = foundApproveTransaction;
    }

    const foundTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this._dataProduct.address &&
      transaction.blocksAction === ActionButtonType.Buy
    );

    if (this.pendingTransaction && !foundTransaction) {
      this.onTransactionFinish(
        await this.transactionService.getTransactionReceipt(this.pendingTransaction.transactionHash)
      );
    } else {
      this.pendingTransaction = foundTransaction;
    }
  }

  onTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      this.awaitingFinalisationService.addProduct(this._dataProduct);
      this.walletService.updateBalance();
      this.dialog.open(MarketplacePurchaseConfirmationDialogComponent);
      this.emitBuyConfirmedEvent(transactionReceipt);

      this._finished = true;
      this._status = STATUS.FINISHED;
      this._progress = 100;
    }

    this._taskManagerService.onTaskEvent();

    delete this.pendingTransaction;
  }

  async onApproveTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      this._status = STATUS.PURCHASING;
      this._taskManagerService.onTaskEvent();

      const { publicKey } = await this.keyStoreDialogServiceSpy.getKeys({ publicKey: true });
      const serializedKey = await this.repuxLibService.getInstance().serializePublicKey(publicKey);

      const transaction = await this.commonDialogService.transaction(
        () => this.dataProductService.purchaseDataProduct(this._dataProduct.address, serializedKey)
      );

      transaction.subscribe(transactionEvent => {
        if (transactionEvent.type === TransactionEventType.Confirmed) {
          this._status = STATUS.PURCHASING_TRANSACTION;
          return;
        }

        if (transactionEvent.type === TransactionEventType.Rejected ||
          transactionEvent.type === TransactionEventType.Dropped) {
          this._errors.push(transactionEvent.error.message);
          this.cancel();
        }
      });
    }

    delete this.pendingApproveTransaction;
  }

  private emitBuyConfirmedEvent(transactionReceipt: TransactionReceipt): void {
    this.tagManagerService.sendEvent(
      EventCategory.Buy,
      EventAction.BuyConfirmed,
      this._dataProduct.title,
      this._dataProduct.price ? this._dataProduct.price.toString() : '',
      transactionReceipt.gasUsed,
      {
        currencyCode: environment.analyticsCurrencySubstitute,
        originalCurrency: environment.repux.currency.defaultName,
        purchase: {
          actionField: {
            id: transactionReceipt.transactionHash,
            revenue: this._dataProduct.price.toString(),
          },
          products: [ {
            id: this._dataProduct.address,
            name: this._dataProduct.title,
            brand: this._dataProduct.ownerAddress,
            category: this._dataProduct.category.join(', '),
            price: this._dataProduct.price.toString(),
            quantity: 1
          } ]
        }
      }
    );
  }
}
