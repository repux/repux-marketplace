import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { DataProductService } from '../../services/data-product.service';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProduct as BlockchainDataProduct, TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';

@Component({
  selector: 'app-marketplace-unpublish-button',
  templateUrl: './marketplace-unpublish-button.component.html'
})
export class MarketplaceUnpublishButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  @Input() blockchainDataProduct: BlockchainDataProduct;

  dataProductAddress: string;
  wallet: Wallet;
  userIsOwner: boolean;
  pendingTransaction?: Transaction;

  private walletSubscription: Subscription;
  private transactionsSubscription: Subscription;

  constructor(
    private walletService: WalletService,
    private dataProductService: DataProductService,
    private tagManager: TagManagerService,
    private unpublishedProductsService: UnpublishedProductsService,
    private commonDialogService: CommonDialogService,
    private transactionService: TransactionService
  ) {
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
    this.transactionsSubscription = this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
  }

  getUserIsOwner(): boolean {
    return this.wallet.address === this.dataProduct.ownerAddress;
  }

  onTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      if (!this.blockchainDataProduct.fundsAccumulated.minus(this.blockchainDataProduct.buyersDeposit).isGreaterThan(0)) {
        this.addProductToUnpublishedProducts(this.dataProduct);
      }
      this.blockchainDataProduct.disabled = true;
      this.tagManager.sendEvent(
        EventCategory.Sell,
        EventAction.UnpublishConfirmed,
        this.dataProduct.title,
        this.dataProduct.price ? this.dataProduct.price.toString() : ''
      );
    }

    delete this.pendingTransaction;
  }

  async onTransactionsListChange(transactions: Transaction[]) {
    const foundTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this.dataProductAddress &&
      transaction.blocksAction === ActionButtonType.Unpublish
    );

    if (this.pendingTransaction && !foundTransaction) {
      this.onTransactionFinish(
        await this.transactionService.getTransactionReceipt(this.pendingTransaction.transactionHash)
      );
    } else {
      this.pendingTransaction = foundTransaction;
    }
  }

  unpublish() {
    this.tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.UnpublishButton,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    this.commonDialogService.transaction(
      () => this.dataProductService.disableDataProduct(this.dataProductAddress)
    );
  }

  ngOnDestroy() {
    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }

    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }

  addProductToUnpublishedProducts(dataProduct: DataProduct): void {
    const product = Object.assign({}, dataProduct);
    delete product.address;
    delete product.orders;

    this.unpublishedProductsService.addProduct(product);
  }

  private onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }
}
