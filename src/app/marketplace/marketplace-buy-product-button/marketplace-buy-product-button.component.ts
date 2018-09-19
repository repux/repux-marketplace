import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RepuxLibService } from '../../services/repux-lib.service';
import { WalletService } from '../../services/wallet.service';
import { DataProductService } from '../../services/data-product.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import Wallet from '../../shared/models/wallet';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProduct } from '../../shared/models/data-product';
import { AwaitingFinalisationService } from '../services/awaiting-finalisation.service';
import { DataProductOrder as BlockchainDataProductOrder, DataProduct as BlockchainDataProduct } from '@repux/repux-web3-api';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
// tslint:disable-next-line:max-line-length
import { MarketplaceBeforeBuyConfirmationDialogComponent } from '../marketplace-before-buy-confirmation-dialog/marketplace-before-buy-confirmation-dialog.component';
import { KeyStoreDialogService } from '../../key-store/key-store-dialog.service';
import { FileBuyTask } from '../../tasks/file-buy-task';
import { TaskManagerService } from '../../services/task-manager.service';
import BigNumber from 'bignumber.js';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-marketplace-buy-product-button',
  templateUrl: './marketplace-buy-product-button.component.html',
  styleUrls: [ './marketplace-buy-product-button.component.scss' ]
})
export class MarketplaceBuyProductButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  @Input() blockchainDataProduct: BlockchainDataProduct;
  @Input() blockchainDataProductOrder: BlockchainDataProductOrder;

  wallet: Wallet;
  userIsOwner: boolean;
  dataProductAddress: string;
  productOwnerAddress: string;
  pendingTransaction?: Transaction;
  pendingApproveTransaction?: Transaction;

  private walletSubscription: Subscription;
  private transactionsSubscription: Subscription;
  private keysSubscription: Subscription;

  constructor(
    private tagManagerService: TagManagerService,
    private dataProductService: DataProductService,
    private repuxLibService: RepuxLibService,
    private walletService: WalletService,
    private awaitingFinalisationService: AwaitingFinalisationService,
    private transactionService: TransactionService,
    private commonDialogService: CommonDialogService,
    private keyStoreDialogService: KeyStoreDialogService,
    private taskManagerService: TaskManagerService,
    private dialog: MatDialog) {
  }

  get finalised(): boolean {
    return this.blockchainDataProductOrder && this.blockchainDataProductOrder.finalised;
  }

  get bought(): boolean {
    return this.blockchainDataProductOrder && this.blockchainDataProductOrder.purchased;
  }

  get currentPendingTransaction(): Transaction {
    return this.pendingTransaction || this.pendingApproveTransaction;
  }

  ngOnInit(): void {
    this.dataProductAddress = this.dataProduct.address;
    this.productOwnerAddress = this.dataProduct.ownerAddress;
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
    this.transactionsSubscription = this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
  }

  async onTransactionsListChange(transactions: Transaction[]) {
    const foundApproveTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this.dataProductAddress &&
      transaction.blocksAction === ActionButtonType.ApproveBeforeBuy
    );

    if (this.pendingApproveTransaction && !foundApproveTransaction) {
      delete this.pendingApproveTransaction;
    } else {
      this.pendingApproveTransaction = foundApproveTransaction;
    }

    const foundTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this.dataProductAddress &&
      transaction.blocksAction === ActionButtonType.Buy
    );

    if (this.pendingTransaction && !foundTransaction) {
      this.blockchainDataProductOrder = <any> {
        purchased: true
      };
      delete this.pendingTransaction;
    } else {
      this.pendingTransaction = foundTransaction;
    }
  }


  buyDataProduct(): MatDialogRef<MarketplaceBeforeBuyConfirmationDialogComponent | ConfirmationDialogComponent> {
    if (!this.hasSufficentFunds(this.wallet.balance, this.dataProduct.price)) {
      return this.commonDialogService.alert(
        'Unfortunately, you don\'t have sufficient funds to buy this file',
        'Insufficient funds',
        'Got it!'
      );
    }

    const dialogRef = this.dialog.open(MarketplaceBeforeBuyConfirmationDialogComponent);

    dialogRef.componentInstance.dataProduct = this.dataProduct;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendTransaction();
      }
    });

    return dialogRef;
  }

  sendTransaction(): void {
    this.tagManagerService.sendEvent(
      EventCategory.Buy,
      EventAction.Buy,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    const task = new FileBuyTask(
      this.wallet.address,
      this.dataProduct,
      this.commonDialogService,
      this.transactionService,
      this.awaitingFinalisationService,
      this.keyStoreDialogService,
      this.repuxLibService,
      this.dataProductService,
      this.tagManagerService,
      this.walletService,
      this.dialog
    );

    this.taskManagerService.addTask(task);
  }

  getUserIsOwner() {
    return this.wallet && this.wallet.address === this.productOwnerAddress;
  }

  ngOnDestroy() {
    if (this.keysSubscription) {
      this.keysSubscription.unsubscribe();
    }

    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }

    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }

  private onWalletChange(wallet: Wallet): void {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }

  private hasSufficentFunds(walletBalance: BigNumber, productPrice: BigNumber): boolean {
    return walletBalance.comparedTo(productPrice) >= 0;
  }
}
