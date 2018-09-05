import { MatDialog, MatDialogRef } from '@angular/material';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { Injectable, SecurityContext } from '@angular/core';
import { TransactionEvent } from '../models/transaction-event';
import { Observable } from 'rxjs';
import { TransactionEventType } from '../enums/transaction-event-type';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class CommonDialogService {
  constructor(
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
  }

  alert(message: string, title: string = 'Warning', confirmButtonLabel: string = 'Ok', cancelButtonLabel: string = null)
    : MatDialogRef<ConfirmationDialogComponent> {
    const confirmationDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: true
    });

    confirmationDialogRef.componentInstance.title = title;
    confirmationDialogRef.componentInstance.body = message;
    confirmationDialogRef.componentInstance.confirmButton = confirmButtonLabel;
    confirmationDialogRef.componentInstance.cancelButton = cancelButtonLabel;

    return confirmationDialogRef;
  }

  transaction(methodToCall: () => Observable<TransactionEvent>): Observable<TransactionEvent> {
    let currentDialogRef;

    const closeCurrentDialog = () => {
      if (currentDialogRef) {
        currentDialogRef.close();
      }
    };

    const observable = methodToCall();

    observable.subscribe(event => {
      if (event.type === TransactionEventType.Created) {
        closeCurrentDialog();
        currentDialogRef = this.alert(
          'Please confirm transaction in MetaMask extension.',
          'Transaction',
          null
        );

        return;
      }

      if (event.type === TransactionEventType.Confirmed) {
        closeCurrentDialog();
        currentDialogRef = this.alert(
          'Your transaction is being processed. We will inform you when its status changes.',
          'Transaction confirmed'
        );
        return;
      }

      if (event.type === TransactionEventType.Rejected) {
        closeCurrentDialog();
        currentDialogRef = this.alert(
          'Something went wrong while confirming your transaction. Please try again.<br>Details: ' +
          this.sanitizer.sanitize(SecurityContext.HTML, event.error),
          'Transaction rejected'
        );
        return;
      }

      if (event.type === TransactionEventType.Dropped) {
        closeCurrentDialog();
        currentDialogRef = this.alert(
          'Your transaction has been dropped and we cannot track it now.<br>' +
          'It may be related to the increase of the gas price in MetaMask extension.',
          'Transaction dropped'
        );
        return;
      }
    });

    return observable;
  }
}
