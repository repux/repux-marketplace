import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DataProductTransaction } from '../../shared/models/data-product-transaction';
import { MatTableDataSource } from '@angular/material';
import { environment } from '../../../environments/environment';
import { DataProduct } from '../../shared/models/data-product';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-marketplace-data-product-transactions-list',
  templateUrl: './marketplace-data-product-transactions-list.component.html',
  styleUrls: [ './marketplace-data-product-transactions-list.component.scss' ]
})
export class MarketplaceDataProductTransactionsListComponent implements OnChanges {
  @Input() dataProduct: DataProduct;
  @Input() transactions: DataProductTransaction[];
  @Output() finaliseSuccess = new EventEmitter<{ transaction: DataProductTransaction, dataProduct: DataProduct }>();

  public dataSource: MatTableDataSource<DataProductTransaction>;
  public currencyName = ` ${environment.repux.currency.defaultName} `;
  public currencyFormat: string = environment.repux.currency.format;

  @Input() displayedColumns = [
    'buyerAddress',
    'price',
    'date',
    'deliveryDeadline',
    'actions'
  ];

  ngOnChanges() {
    this.dataSource = new MatTableDataSource(this.transactions);
  }

  getTransactionDate(transaction: DataProductTransaction) {
    return new Date((transaction.deliveryDeadline.getTime() - this.dataProduct.daysForDeliver * DAY_IN_MILLISECONDS));
  }

  onFinaliseSuccess(transaction: DataProductTransaction) {
    this.finaliseSuccess.emit({
      dataProduct: this.dataProduct,
      transaction
    });
  }
}
