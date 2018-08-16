import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DataProductOrder } from '../../shared/models/data-product-order';
import { MatTableDataSource } from '@angular/material';
import { environment } from '../../../environments/environment';
import { DataProduct } from '../../shared/models/data-product';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-marketplace-data-product-orders-list',
  templateUrl: './marketplace-data-product-orders-list.component.html',
  styleUrls: [ './marketplace-data-product-orders-list.component.scss' ]
})
export class MarketplaceDataProductOrdersListComponent implements OnChanges {
  @Input() dataProduct: DataProduct;
  @Input() orders: DataProductOrder[];
  @Output() finaliseSuccess = new EventEmitter<{ order: DataProductOrder, dataProduct: DataProduct }>();

  public dataSource: MatTableDataSource<DataProductOrder>;
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
    this.dataSource = new MatTableDataSource(this.orders);
  }

  getOrderDate(order: DataProductOrder) {
    return new Date((order.deliveryDeadline.getTime() - this.dataProduct.daysToDeliver * DAY_IN_MILLISECONDS));
  }

  onFinaliseSuccess(order: DataProductOrder) {
    this.finaliseSuccess.emit({
      dataProduct: this.dataProduct,
      order
    });
  }
}
