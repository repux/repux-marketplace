import { MatDialog, MatDialogRef } from '@angular/material';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonDialogService {
  constructor(
    private dialog: MatDialog
  ) {
  }

  alert(message: string, title: string = 'Warning', confirmButtonLabel: string = 'Ok'): MatDialogRef<ConfirmationDialogComponent> {
    const confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true
    });

    confirmationDialogRef.componentInstance.title = title;
    confirmationDialogRef.componentInstance.body = message;
    confirmationDialogRef.componentInstance.confirmButton = confirmButtonLabel;
    confirmationDialogRef.componentInstance.cancelButton = null;

    return confirmationDialogRef;
  }
}
