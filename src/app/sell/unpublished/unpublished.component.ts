import { Component } from '@angular/core';
import { UnpublishedProductsService } from '../../services/unpublished-products.service';
import { DataProduct } from '../../data-product';

@Component({
  selector: 'app-unpublished-files',
  templateUrl: './unpublished.component.html',
  styleUrls: [ './unpublished.component.scss' ]
})
export class UnpublishedComponent {
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
