import { Component, Input, OnChanges } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { DataProductOrder as BlockchainDataProductOrder, DataProduct as BlockchainDataProduct } from 'repux-web3-api';
import { DataProductService } from '../services/data-product.service';

@Component({
  selector: 'app-notifications-list-orders',
  templateUrl: './notifications-list-orders.component.html',
  styleUrls: [ './notifications-list-orders.component.scss' ]
})
export class NotificationsListOrdersComponent implements OnChanges {
  @Input() dataProduct: DataProduct;

  @Input() blockchainDataProduct: BlockchainDataProduct;
  @Input() displayPendingOrders: boolean;

  blockchainOrders: BlockchainDataProductOrder[] = [];

  displayedColumns: string[] = [ 'buyerAddress', 'date', 'deliveryDeadline', 'actions' ];

  constructor(private _dataProductService: DataProductService) {
  }

  async ngOnChanges() {
    if (this.dataProduct && this.dataProduct.address) {
      this.blockchainOrders = (await this._dataProductService.getAllDataProductOrders(this.dataProduct.address))
        .filter(order => !order.finalised);
    }
  }
}
