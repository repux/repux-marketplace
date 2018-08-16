import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { DataProductService } from '../../services/data-product.service';
import { DataProductOrder as BlockchainDataProductOrder } from 'repux-web3-api';
import { DataProductOrder } from '../../shared/models/data-product-order';

@Component({
  selector: 'app-marketplace-data-product-orders-list-container',
  styleUrls: [ './marketplace-data-product-orders-list-container.component.scss' ],
  templateUrl: './marketplace-data-product-orders-list-container.component.html'
})
export class MarketplaceDataProductOrdersListContainerComponent implements OnChanges {
  @Input() dataProduct: DataProduct;

  @Input() displayPendingOrders: boolean;

  @Output() finaliseSuccess = new EventEmitter<{ order: DataProductOrder, dataProduct: DataProduct }>();

  public blockchainOrders: BlockchainDataProductOrder[] = [];

  constructor(
    private _dataProductService: DataProductService
  ) {
  }

  get ordersToFinalisation() {
    if (!this.blockchainOrders) {
      return [];
    }

    return this.blockchainOrders.filter(order => !order.finalised);
  }

  async ngOnChanges() {
    if (this.dataProduct && this.dataProduct.address) {
      this.blockchainOrders = await this._dataProductService.getAllDataProductOrders(this.dataProduct.address);
    }
  }

  onFinaliseSuccess(event: { order: DataProductOrder, dataProduct: DataProduct }) {
    this.finaliseSuccess.emit(event);
  }
}
