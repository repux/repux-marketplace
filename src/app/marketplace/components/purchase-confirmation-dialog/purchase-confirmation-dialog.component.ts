import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-purchase-confirmation-dialog',
  templateUrl: './purchase-confirmation-dialog.component.html',
  styleUrls: [ './purchase-confirmation-dialog.component.scss' ]
})
export class PurchaseConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PurchaseConfirmationDialogComponent>) {
  }
}
