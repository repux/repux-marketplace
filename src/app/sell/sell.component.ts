import { Component } from '@angular/core';
import { ProductCreatorDialogComponent } from '../product-creator-dialog/product-creator-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-selling',
  templateUrl: './sell.component.html',
  styleUrls: [ './sell.component.scss' ]
})
export class SellComponent {
  navLinks = [
    {
      label: 'My active listings',
      path: 'my-active-listings'
    },
    {
      label: 'Unpublished',
      path: 'unpublished'
    },
    {
      label: 'Pending finalisation',
      path: 'pending-finalisation'
    }
  ];

  constructor(private _dialog: MatDialog) {
  }

  openProductCreatorDialog() {
    this._dialog.open(ProductCreatorDialogComponent);
  }
}
