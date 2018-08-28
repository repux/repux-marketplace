import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RepuxLibService } from '../../services/repux-lib.service';
import { WalletService } from '../../services/wallet.service';
import { DataProductService } from '../../services/data-product.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import Wallet from '../../shared/models/wallet';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProduct } from '../../shared/models/data-product';
import {
  MarketplacePurchaseConfirmationDialogComponent
} from '../marketplace-purchase-confirmation-dialog/marketplace-purchase-confirmation-dialog.component';
import { AwaitingFinalisationService } from '../services/awaiting-finalisation.service';
import { DataProductOrder as BlockchainDataProducOrder, TransactionReceipt, TransactionStatus } from 'repux-web3-api';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { environment } from '../../../environments/environment';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { MarketplaceBeforeBuyConfirmationDialogComponent } from '../marketplace-before-buy-confirmation-dialog/marketplace-before-buy-confirmation-dialog.component';
import { KeyStoreDialogService } from '../../key-store/key-store-dialog.service';
import BigNumber from 'bignumber.js';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-marketplace-buy-product-button',
  templateUrl: './marketplace-buy-product-button.component.html',
  styleUrls: [ './marketplace-buy-product-button.component.scss' ]
})
export class MarketplaceBuyProductButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  @Input() blockchainDataProductOrder: BlockchainDataProducOrder;

  public wallet: Wallet;
  public userIsOwner: boolean;
  public dataProductAddress: string;
  public productOwnerAddress: string;
  public pendingTransaction?: Transaction;
  public pendingApproveTransaction?: Transaction;

  private walletSubscription: Subscription;
  private transactionsSubscription: Subscription;
  private keysSubscription: Subscription;

  constructor(
    private tagManager: TagManagerService,
    private dataProductService: DataProductService,
    private repuxLibService: RepuxLibService,
    private walletService: WalletService,
    private awaitingFinalisationService: AwaitingFinalisationService,
    private transactionService: TransactionService,
    private commonDialogService: CommonDialogService,
    private keyStoreDialogServiceSpy: KeyStoreDialogService,
    private dialog: MatDialog) {
  }

  get finalised(): boolean {
    return this.blockchainDataProductOrder && this.blockchainDataProductOrder.finalised;
  }

  get bought(): boolean {
    return this.blockchainDataProductOrder && this.blockchainDataProductOrder.purchased;
  }

  get hasPendingTransaction(): boolean {
    return Boolean(this.pendingTransaction || this.pendingApproveTransaction);
  }

  ngOnInit(): void {
    this.dataProductAddress = this.dataProduct.address;
    this.productOwnerAddress = this.dataProduct.ownerAddress;
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
    this.transactionsSubscription = this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
  }

  onTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      this.blockchainDataProductOrder = <any> {
        purchased: true
      };
      this.awaitingFinalisationService.addProduct(this.dataProduct);
      this.dialog.open(MarketplacePurchaseConfirmationDialogComponent);
      this.emitBuyConfirmedEvent(transactionReceipt);
    }

    delete this.pendingTransaction;
  }

  async onTransactionsListChange(transactions: Transaction[]) {
    const foundApproveTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProduct &&
      transaction.identifier === this.dataProductAddress &&
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
      transaction.identifier === this.dataProductAddress &&
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

  async onApproveTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      const { publicKey } = await this.keyStoreDialogServiceSpy.getKeys({ publicKey: true });
      const serializedKey = await this.repuxLibService.getInstance().serializePublicKey(publicKey);

      this.commonDialogService.transaction(
        () => this.dataProductService.purchaseDataProduct(this.dataProductAddress, serializedKey)
      );
    }

    delete this.pendingApproveTransaction;
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
    this.tagManager.sendEvent(
      EventCategory.Buy,
      EventAction.Buy,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    this.commonDialogService.transaction(
      () => this.dataProductService.approveTokensTransferForDataProductPurchase(this.dataProductAddress)
    );
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

  private emitBuyConfirmedEvent(transactionReceipt: TransactionReceipt): void {
    this.tagManager.sendEvent(
      EventCategory.Buy,
      EventAction.BuyConfirmed,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : '',
      transactionReceipt.gasUsed,
      {
        currencyCode: environment.analyticsCurrencySubstitute,
        originalCurrency: environment.repux.currency.defaultName,
        purchase: {
          actionField: {
            id: transactionReceipt.transactionHash,
            revenue: this.dataProduct.price.toString(),
          },
          products: [ {
            id: this.dataProduct.address,
            name: this.dataProduct.title,
            brand: this.dataProduct.ownerAddress,
            category: this.dataProduct.category.join(', '),
            price: this.dataProduct.price.toString(),
            quantity: 1
          } ]
        }
      }
    );
  }

  private onWalletChange(wallet: Wallet): void {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }

  private hasSufficentFunds(walletBalance: number, productPrice: BigNumber): boolean {
    return new BigNumber(walletBalance).comparedTo(productPrice) >= 0;
  }
}
