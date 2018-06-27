import { Component } from '@angular/core';
import { ProductCreatorDialogComponent } from '../product-creator-dialog/product-creator-dialog.component';
import { MatDialog } from '@angular/material';
import { DataProductNotificationsService } from '../services/data-product-notifications.service';
import { UnpublishedProductsService } from '../services/unpublished-products.service';

@Component({
  selector: 'app-selling',
  templateUrl: './sell.component.html',
  styleUrls: [ './sell.component.scss' ]
})
export class SellComponent {
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

  constructor(
    private _dialog: MatDialog,
    private _dataProductNotificationsService: DataProductNotificationsService,
    private _unpublishedProductsService: UnpublishedProductsService
  ) {
    this.navLinks.find(link => link.path === 'pending-finalisation').items = _dataProductNotificationsService.finalisationRequests;
    this.navLinks.find(link => link.path === 'unpublished').items = _unpublishedProductsService.products;
  }

  openProductCreatorDialog() {
    this._dialog.open(ProductCreatorDialogComponent, {
      disableClose: true
    });
  }
}
