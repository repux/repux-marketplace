import { Component } from '@angular/core';
import { ProductCreatorDialogComponent } from '../product-creator-dialog/product-creator-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: [ './marketplace.component.scss' ]
})
export class MarketplaceComponent {

  constructor(private _dialog: MatDialog) {
  }

  openProductCreatorDialog() {
    this._dialog.open(ProductCreatorDialogComponent);
  }
}
