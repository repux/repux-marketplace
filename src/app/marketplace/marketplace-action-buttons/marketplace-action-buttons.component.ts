import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { DataProduct as BlockchainDataProduct, DataProductOrder as BlockchainDataProductOrder } from 'repux-web3-api';
import { DataProductService } from '../../services/data-product.service';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { Subscription } from 'rxjs';
import { BigNumber } from 'bignumber.js';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';

@Component({
  selector: 'app-marketplace-action-buttons',
  templateUrl: './marketplace-action-buttons.component.html',
  styleUrls: [ './marketplace-action-buttons.component.scss' ]
})
export class MarketplaceActionButtonsComponent implements OnDestroy, OnChanges, OnInit {
  @Input() availableActions: ActionButtonType[] = [];

  @Input() dataProduct: DataProduct;

  @Input() blockchainDataProduct?: BlockchainDataProduct;

  @Input() blockchainDataProductOrder?: BlockchainDataProductOrder;

  fundsToWithdraw?: BigNumber;

  loading = true;

  actionButtonType = ActionButtonType;

  droppedTransaction: Transaction;

  private _walletSubscription: Subscription;
  private droppedTransactionsSubscription: Subscription;

  private _wallet: Wallet;

  constructor(
    private _dataProductService: DataProductService,
    private _walletService: WalletService,
    private transactionService: TransactionService
  ) {
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  ngOnInit() {
    this.droppedTransactionsSubscription = this.transactionService.getDroppedTransactions()
      .subscribe(transactions => this.onDroppedTransactionsChange(transactions));
  }

  ngOnDestroy() {
    this._walletSubscription.unsubscribe();

    if (this.droppedTransactionsSubscription) {
      this.droppedTransactionsSubscription.unsubscribe();
    }
  }

  ngOnChanges() {
    this._fetchDataFromBlockchain();
  }

  onDroppedTransactionsChange(transactions: Transaction[]): void {
    this.droppedTransaction = transactions.find(transaction =>
      [ this.dataProduct.address, this.dataProduct.sellerMetaHash ].includes(transaction.identifier)
    );
  }

  removeDroppedTransactions() {
    this.transactionService.removeDroppedTransactions(this.dataProduct.address);
    this.transactionService.removeDroppedTransactions(this.dataProduct.sellerMetaHash);
  }

  private _onWalletChange(wallet: Wallet): Promise<void> {
    this._wallet = wallet;
    return this._fetchDataFromBlockchain();
  }

  private async _fetchDataFromBlockchain(): Promise<void> {
    if (this.dataProduct && this._wallet) {
      if (this.dataProduct.address) {
        this.loading = true;

        if (!this.blockchainDataProductOrder) {
          this.blockchainDataProductOrder = await this._dataProductService.getOrderData(this.dataProduct.address, this._wallet.address);
        }

        if (this.dataProduct.blockchainState) {
          this.blockchainDataProduct = this.dataProduct.blockchainState;
        } else if (!this.blockchainDataProduct) {
          this.blockchainDataProduct = await this._dataProductService.getDataProductData(this.dataProduct.address);
        }
      }
      this.loading = false;
    }
  }
}
