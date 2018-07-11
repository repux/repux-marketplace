import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { Observable } from 'rxjs/internal/Observable';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs/internal/Subscription';
import {
  MarketplaceProductCreatorDialogComponent
} from './marketplace-product-creator-dialog/marketplace-product-creator-dialog.component';
import { PendingFinalisationService } from '../services/data-product-notifications/pending-finalisation.service';
import { DataProductNotificationsService } from '../services/data-product-notifications.service';

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
  isHandset$: Observable<boolean> = this._breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );
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

  private _myActiveListingsSubscription: Subscription;
  private _unpublishedProductsSubscription: Subscription;
  private _pendingFinalisationSubscription: Subscription;
  private _myActiveListingsLink;
  private _unpublishedLink;
  private _pendingFinalisationLink;

  constructor(
    private _dialog: MatDialog,
    private _breakpointObserver: BreakpointObserver,
    private _dataProductNotificationsService: DataProductNotificationsService,
    private _unpublishedProductsService: UnpublishedProductsService,
    private _pendingFinalisationService: PendingFinalisationService,
  ) {
    this._myActiveListingsLink = this.navLinks.find(link => link.path === MarketplaceSellLink.MY_ACTIVE_LISTINGS);
    this._unpublishedLink = this.navLinks.find(link => link.path === MarketplaceSellLink.UNPUBLISHED);
    this._pendingFinalisationLink = this.navLinks.find(link => link.path === MarketplaceSellLink.PENDING_FINALISATION);

    this._myActiveListingsSubscription = this._dataProductNotificationsService.getCreatedProductsAddresses()
      .subscribe(createdProducts => this._myActiveListingsLink.items = createdProducts);

    this._unpublishedProductsSubscription = this._unpublishedProductsService.getProducts()
      .subscribe(products => this._unpublishedLink.items = products);

    this._pendingFinalisationSubscription = this._pendingFinalisationService.getEntries()
      .subscribe(pendingFinalisation => this._pendingFinalisationLink.items = pendingFinalisation);
  }

  openProductCreatorDialog() {
    this._dialog.open(MarketplaceProductCreatorDialogComponent, {
      disableClose: true
    });
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
