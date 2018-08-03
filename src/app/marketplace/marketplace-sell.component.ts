import { Component, OnDestroy } from '@angular/core';
import { UnpublishedProductsService } from './services/unpublished-products.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs/internal/Subscription';
import { MyActiveListingsService } from './services/my-active-listings.service';
import { PendingFinalisationService } from './services/pending-finalisation.service';
import { environment } from '../../environments/environment';

export enum MarketplaceSellLink {
  MY_ACTIVE_LISTINGS = 'my-active-listings',
  UNPUBLISHED = 'unpublished',
  PENDING_FINALISATION = 'pending-finalisation'
}

@Component({
  selector: 'app-marketplace-sell',
  templateUrl: './marketplace-sell.component.html',
  styleUrls: [ './marketplace-sell.component.scss' ]
})
export class MarketplaceSellComponent implements OnDestroy {
  navLinks = [
    {
      label: 'My active listings',
      path: MarketplaceSellLink.MY_ACTIVE_LISTINGS,
      items: []
    },
    {
      label: 'Unpublished',
      path: MarketplaceSellLink.UNPUBLISHED,
      items: []
    },
    {
      label: 'Pending finalisation',
      path: MarketplaceSellLink.PENDING_FINALISATION,
      items: []
    }
  ];

  maxItemsNumber = environment.maxNotificationsProductsNumber;

  private _myActiveListingsSubscription: Subscription;
  private _unpublishedProductsSubscription: Subscription;
  private _pendingFinalisationSubscription: Subscription;
  private _myActiveListingsLink;
  private _unpublishedLink;
  private _pendingFinalisationLink;

  constructor(
    private _breakpointObserver: BreakpointObserver,
    private _myActiveListingsService: MyActiveListingsService,
    private _unpublishedProductsService: UnpublishedProductsService,
    private _pendingFinalisationService: PendingFinalisationService,
  ) {
    this._myActiveListingsLink = this.navLinks.find(link => link.path === MarketplaceSellLink.MY_ACTIVE_LISTINGS);
    this._unpublishedLink = this.navLinks.find(link => link.path === MarketplaceSellLink.UNPUBLISHED);
    this._pendingFinalisationLink = this.navLinks.find(link => link.path === MarketplaceSellLink.PENDING_FINALISATION);

    this._myActiveListingsSubscription = this._myActiveListingsService.getProducts()
      .subscribe(createdProducts => this._myActiveListingsLink.items = createdProducts);

    this._unpublishedProductsSubscription = this._unpublishedProductsService.getProducts()
      .subscribe(products => this._unpublishedLink.items = products);

    this._pendingFinalisationSubscription = this._pendingFinalisationService.getOrders()
      .subscribe(pendingFinalisation => this._pendingFinalisationLink.items = pendingFinalisation);
  }

  ngOnDestroy() {
    if (this._pendingFinalisationSubscription) {
      this._pendingFinalisationSubscription.unsubscribe();
    }

    if (this._unpublishedProductsSubscription) {
      this._unpublishedProductsSubscription.unsubscribe();
    }
  }
}
