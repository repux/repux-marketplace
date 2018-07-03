import { Component, OnDestroy } from '@angular/core';
import { ProductCreatorDialogComponent } from '../components/product-creator-dialog/product-creator-dialog.component';
import { MatDialog } from '@angular/material';
import { DataProductNotificationsService } from '../../services/data-product-notifications.service';
import { UnpublishedProductsService } from '../../services/unpublished-products.service';
import { Observable } from 'rxjs/internal/Observable';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-selling',
  templateUrl: './sell.component.html',
  styleUrls: [ './sell.component.scss' ]
})
export class SellComponent implements OnDestroy {
  isHandset$: Observable<boolean> = this._breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );
  navLinks = [
    {
      label: 'My active listings',
      path: 'my-active-listings',
      items: []
    },
    {
      label: 'Unpublished',
      path: 'unpublished',
      items: []
    },
    {
      label: 'Pending finalisation',
      path: 'pending-finalisation',
      items: []
    }
  ];

  private _finalisationRequestsSubscription: Subscription;

  constructor(
    private _dialog: MatDialog,
    private _breakpointObserver: BreakpointObserver,
    private _dataProductNotificationsService: DataProductNotificationsService,
    private _unpublishedProductsService: UnpublishedProductsService
  ) {
    this._finalisationRequestsSubscription = this._dataProductNotificationsService.getFinalisationRequests()
      .subscribe(finalisationRequests => {
        this.navLinks.find(link => link.path === 'pending-finalisation').items = finalisationRequests;
      });

    this.navLinks.find(link => link.path === 'unpublished').items = _unpublishedProductsService.products;
  }

  openProductCreatorDialog() {
    this._dialog.open(ProductCreatorDialogComponent, {
      disableClose: true
    });
  }

  ngOnDestroy() {
    if (this._finalisationRequestsSubscription) {
      this._finalisationRequestsSubscription.unsubscribe();
    }
  }
}
