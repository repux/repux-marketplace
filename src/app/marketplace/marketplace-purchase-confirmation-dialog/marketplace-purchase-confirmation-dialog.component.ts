import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-purchase-confirmation-dialog',
  templateUrl: './marketplace-purchase-confirmation-dialog.component.html',
  styleUrls: [ './marketplace-purchase-confirmation-dialog.component.scss' ]
})
export class MarketplacePurchaseConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MarketplacePurchaseConfirmationDialogComponent>) {
  }
}
