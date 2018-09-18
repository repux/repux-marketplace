import { MatDialog, MatDialogRef } from '@angular/material';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { Injectable, SecurityContext } from '@angular/core';
import { TransactionEvent } from '../models/transaction-event';
import { Observable } from 'rxjs';
import { TransactionEventType } from '../enums/transaction-event-type';
import { DomSanitizer } from '@angular/platform-browser';
import { WalletService } from '../../services/wallet.service';
import BigNumber from 'bignumber.js';

@Injectable({
  providedIn: 'root'
})
export class CommonDialogService {
  private balance: { repux: BigNumber, eth: BigNumber };

  constructor(
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private walletService: WalletService
  ) {
    this.walletService.getBalance().subscribe(balance => this.balance = balance);
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

  async transaction(methodToCall: () => Observable<TransactionEvent>): Promise<Observable<TransactionEvent>> {
    let currentDialogRef;

    const closeCurrentDialog = () => {
      if (currentDialogRef) {
        currentDialogRef.close();
      }
    };

    if (this.balance && this.balance.eth.eq(0)) {
      await this.showInsufficientFundsWarning();
    }

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
          this.sanitizer.sanitize(SecurityContext.HTML, event.error.message),
          'Transaction rejected'
        );
        return;
      }

      if (event.type === TransactionEventType.Dropped) {
        closeCurrentDialog();

        if (event.transactionObject && event.transactionObject.isBuyFirstTransaction) {
          currentDialogRef = this.alert(
            'Your transaction has been dropped and we cannot track it now.<br>' +
            'It may be related to the increase of the gas price in MetaMask extension.<br>' +
            'Please wait until the second transaction is confirmed and click on the <strong>Buy</strong> button again,<br>' +
            ' we will continue where you have left.',
            'Transaction dropped'
          );
          return;
        }

        currentDialogRef = this.alert(
          'Your transaction has been dropped and we cannot track it now.<br>' +
          'It may be related to the increase of the gas price in MetaMask extension.<br>' +
          'Please wait until the second transaction is confirmed and we will get updated status from blockchain.<br>' +
          'If still pending please refresh the page.',
          'Transaction dropped'
        );
        return;
      }
    });

    return observable;
  }

  showInsufficientFundsWarning(): Promise<any> {
    const currentDialogRef = this.alert(`
        <p>
          If you are getting the error, "Insufficient funds" in MetaMask,<br>
          it means you do not have enough ETH in your account to cover the cost of gas.
        </p>
        <p>
          Each transaction (even on the test network!) require gas and that gas is paid in ETH.<br>
          You can think of this like a transaction fee.
        </p>
        <p>
          Please check this guide on
          <a href="http://help.repux.io/repux-marketplace-tutorial/how-to-start/how-to-get-free-test-ethereum"
             target="_blank">
              How to get test ETH for free.
          </a>
        </p>`,
      'Warning',
      'Got it!'
    );

    return currentDialogRef.afterClosed().toPromise();
  }
}
