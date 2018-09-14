import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { DataProductService } from '../../services/data-product.service';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { ClockService } from '../../services/clock.service';
import { Subscription } from 'rxjs/internal/Subscription';
import {
  DataProductOrder as BlockchainDataProductOrder,
  DataProduct as BlockchainDataProduct,
  TransactionReceipt,
  TransactionStatus
} from 'repux-web3-api';
import { AwaitingFinalisationService } from '../services/awaiting-finalisation.service';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { CommonDialogService } from '../../shared/services/common-dialog.service';

@Component({
  selector: 'app-marketplace-cancel-purchase-button',
  templateUrl: './marketplace-cancel-purchase-button.component.html',
})
export class MarketplaceCancelPurchaseButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  @Input() blockchainDataProduct: BlockchainDataProduct;
  @Input() blockchainDataProductOrder: BlockchainDataProductOrder;

  dataProductAddress: string;
  wallet: Wallet;
  isAfterDeliveryDeadline: boolean;
  isAwaiting: boolean;
  pendingTransaction: Transaction;

  private clockSubscription: Subscription;
  private walletSubscription: Subscription;
  private awaitingFinalisationSubscription: Subscription;
  private transactionsSubscription: Subscription;

  constructor(
    private walletService: WalletService,
    private dataProductService: DataProductService,
    private clockService: ClockService,
    private awaitingFinalisationService: AwaitingFinalisationService,
    private tagManager: TagManagerService,
    private transactionService: TransactionService,
    private commonDialogService: CommonDialogService
  ) {
  }

  get userIsBuyer(): boolean {
    return Boolean(this.blockchainDataProductOrder);
  }

  get isDisabled(): boolean {
    return this.blockchainDataProduct && this.blockchainDataProduct.disabled;
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;

    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));

    this.clockSubscription = this.clockService.onEachSecond().subscribe(date => {
      this.isAfterDeliveryDeadline = this.checkIfAfterDeliveryDeadline(date);
    });

    this.awaitingFinalisationSubscription = this.awaitingFinalisationService.getProducts()
      .subscribe(() => this.checkIfIsAwaiting());

    this.transactionsSubscription = this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
  }

  onTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      this.awaitingFinalisationService.removeProduct(this.dataProduct);
      this.dataProduct.orders = this.dataProduct.orders.filter(order =>
        order.buyerAddress !== this.blockchainDataProductOrder.buyerAddress
      );
      delete this.blockchainDataProductOrder;

      this.tagManager.sendEvent(
        EventCategory.Buy,
        EventAction.CancelPendingOrderConfirmed,
        this.dataProduct.title,
        this.dataProduct.price ? this.dataProduct.price.toString() : ''
      );

      this.walletService.updateBalance();
    }

    delete this.pendingTransaction;
  }

  async onTransactionsListChange(transactions: Transaction[]) {
    const foundTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this.dataProductAddress &&
      transaction.blocksAction === ActionButtonType.CancelPurchase
    );

    if (this.pendingTransaction && !foundTransaction) {
      this.onTransactionFinish(
        await this.transactionService.getTransactionReceipt(this.pendingTransaction.transactionHash)
      );
    } else {
      this.pendingTransaction = foundTransaction;
    }
  }

  cancelPurchase() {
    this.tagManager.sendEvent(
      EventCategory.Buy,
      EventAction.CancelPendingOrder,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    this.commonDialogService.transaction(
      () => this.dataProductService.cancelDataProductPurchase(this.dataProductAddress)
    );
  }

  ngOnDestroy() {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }

    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }

    if (this.awaitingFinalisationSubscription) {
      this.awaitingFinalisationSubscription.unsubscribe();
    }

    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }

  checkIfAfterDeliveryDeadline(date: Date) {
    if (!this.blockchainDataProductOrder) {
      return false;
    }

    return date > this.blockchainDataProductOrder.deliveryDeadline;
  }

  private onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
  }

  private checkIfIsAwaiting() {
    this.isAwaiting = Boolean(this.awaitingFinalisationService.findProduct(this.dataProductAddress));
  }
}
