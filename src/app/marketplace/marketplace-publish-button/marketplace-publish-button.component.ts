import { Component, Input, OnDestroy } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { DataProductService } from '../../services/data-product.service';
import Wallet from '../../shared/models/wallet';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';

@Component({
  selector: 'app-marketplace-publish-button',
  templateUrl: './marketplace-publish-button.component.html',
  styleUrls: [ './marketplace-publish-button.component.scss' ]
})
export class MarketplacePublishButtonComponent implements OnDestroy {
  @Input() dataProduct: DataProduct;
  public dataProductAddress: string;
  public wallet: Wallet;
  public pendingTransaction?: Transaction;

  private transactionDialogSubscription: Subscription;
  private unpublishedProductsSubscription: Subscription;
  private transactionsSubscription: Subscription;
  private products: DataProduct[];

  constructor(
    private tagManager: TagManagerService,
    private unpublishedProductsService: UnpublishedProductsService,
    private dataProductService: DataProductService,
    private commonDialogService: CommonDialogService,
    private transactionService: TransactionService
  ) {
    this.unpublishedProductsSubscription = this.unpublishedProductsService.getProducts().subscribe(products => this.products = products);
    this.transactionsSubscription = this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
  }

  get hasPendingTransaction(): boolean {
    return Boolean(this.pendingTransaction);
  }

  get isUnpublished() {
    return this.products.find(dataProduct => dataProduct.sellerMetaHash === this.dataProduct.sellerMetaHash);
  }

  onTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      this.unpublishedProductsService.removeProduct(this.dataProduct);
      this.tagManager.sendEvent(
        EventCategory.Sell,
        EventAction.PublishButtonConfirmed,
        this.dataProduct.title,
        this.dataProduct.price ? this.dataProduct.price.toString() : ''
      );
    }
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
    }

    this.pendingTransaction = foundTransaction;
  }

  publish() {
    this.tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.PublishButton,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    this.commonDialogService.transaction(
      () => this.dataProductService.publishDataProduct(
        this.dataProduct.sellerMetaHash,
        this.dataProduct.price,
        this.dataProduct.daysToDeliver
      ));
  }

  remove() {
    this.tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.RemoveUnpublished,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    this.unsubscribeTransactionDialog();
    this.transactionDialogSubscription = this.commonDialogService.alert(
      `Are you sure you want to delete product ${this.dataProduct.name}?`,
      'Removing unpublished file',
      'Yes',
      'No'
    ).afterClosed().subscribe(result => {
      if (result) {
        this.unpublishedProductsService.removeProduct(this.dataProduct);

        this.tagManager.sendEvent(
          EventCategory.Sell,
          EventAction.RemoveUnpublishedConfirmed,
          this.dataProduct.title,
          this.dataProduct.price ? this.dataProduct.price.toString() : ''
        );
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribeTransactionDialog();

    if (this.unpublishedProductsSubscription) {
      this.unpublishedProductsSubscription.unsubscribe();
    }

    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }

  unsubscribeTransactionDialog() {
    if (this.transactionDialogSubscription) {
      this.transactionDialogSubscription.unsubscribe();
      this.transactionDialogSubscription = null;
    }
  }
}
