import { Component } from '@angular/core';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { DataProduct } from '../shared/models/data-product';

@Component({
  selector: 'app-marketplace-sell-unpublished-files',
  templateUrl: './marketplace-sell-unpublished.component.html',
  styleUrls: [ './marketplace-sell-unpublished.component.scss' ]
})
export class MarketplaceSellUnpublishedComponent {
  public availableActions = [
    'publish'
  ];

  constructor(
    private _unpublishedProductsService: UnpublishedProductsService
  ) {
  }

  get dataProducts(): DataProduct[] {
    return this._unpublishedProductsService.products;
  }
}
