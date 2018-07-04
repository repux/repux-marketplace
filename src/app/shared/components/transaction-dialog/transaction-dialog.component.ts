import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: [ './transaction-dialog.component.scss' ]
})
export class TransactionDialogComponent {
  @Input() transaction;

  public error: string;

  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>) {
  }

  public async callTransaction() {
    try {
      this.error = null;
      await this.transaction();
    } catch (error) {
      this.error = error.message;
    }

    if (!this.error) {
      this.dialogRef.close(true);
    }
  }
}
