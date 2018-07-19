import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { DataProductService } from '../../services/data-product.service';
import { DataProductTransaction as BlockchainDataProductTransaction } from 'repux-web3-api';
import { DataProductTransaction } from '../../shared/models/data-product-transaction';

@Component({
  selector: 'app-marketplace-data-product-transactions-list-container',
  styleUrls: [ './marketplace-data-product-transactions-list-container.component.scss' ],
  templateUrl: './marketplace-data-product-transactions-list-container.component.html'
})
export class MarketplaceDataProductTransactionsListContainerComponent implements OnChanges {
  @Input() dataProduct: DataProduct;

  @Input() displayPendingTransactions: boolean;

  @Output() finaliseSuccess = new EventEmitter<{ transaction: DataProductTransaction, dataProduct: DataProduct }>();

  public blockchainTransactions: BlockchainDataProductTransaction[] = [];

  constructor(
    private _dataProductService: DataProductService
  ) {
  }

  get transactionsToFinalisation() {
    if (!this.blockchainTransactions) {
      return [];
    }

    return this.blockchainTransactions.filter(transaction => !transaction.finalised);
  }

  async ngOnChanges() {
    if (this.dataProduct && this.dataProduct.address) {
      this.blockchainTransactions = await this._dataProductService.getAllDataProductTransactions(this.dataProduct.address);
    }
  }

  onFinaliseSuccess(event: { transaction: DataProductTransaction, dataProduct: DataProduct }) {
    this.finaliseSuccess.emit(event);
  }
}
