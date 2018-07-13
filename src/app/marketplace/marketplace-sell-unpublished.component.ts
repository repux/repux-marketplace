import { Component, OnDestroy } from '@angular/core';
import { UnpublishedProductsService } from './services/unpublished-products.service';
import { DataProduct } from '../shared/models/data-product';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-marketplace-sell-unpublished-files',
  templateUrl: './marketplace-sell-unpublished.component.html',
  styleUrls: [ './marketplace-sell-unpublished.component.scss' ]
})
export class MarketplaceSellUnpublishedComponent implements OnDestroy {
  public displayedColumns = [
    'name',
    'title',
    'category',
    'daysForDeliver',
    'size',
    'price',
    'actions'
  ];

  public availableActions = [
    'publish'
  ];

  dataProducts: DataProduct[];

  private _unpublishedProductsSubscription: Subscription;

  constructor(
    private _unpublishedProductsService: UnpublishedProductsService
  ) {
    this._unpublishedProductsSubscription = this._unpublishedProductsService.getProducts()
      .subscribe(products => this.dataProducts = products);
  }

  ngOnDestroy() {
    this._unpublishedProductsSubscription.unsubscribe();
  }
}
