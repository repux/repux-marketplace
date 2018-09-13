import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { environment } from '../../../../environments/environment.base';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WalletService } from '../../../services/wallet.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-issue-demo-tokens',
  templateUrl: './issue-demo-tokens.component.html',
  styleUrls: [ './issue-demo-tokens.component.scss' ]
})
export class IssueDemoTokensComponent implements OnDestroy {
  formGroup: FormGroup;
  private faucetUrl = environment.faucetUrl + '/issue-demo-token';
  private subscription: Subscription;
  error: string;
  loading = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<IssueDemoTokensComponent>,
    private walletService: WalletService
  ) {
    this.formGroup = this.fb.group({
      walletAddress: [ '',
        [
          Validators.minLength(42),
          Validators.maxLength(42)
        ]
      ]
    });
  }

  generate() {
    if (this.formGroup.controls[ 'walletAddress' ].hasError('server')) {
      this.formGroup.controls[ 'walletAddress' ].setErrors({ server: null });
      this.formGroup.controls[ 'walletAddress' ].updateValueAndValidity();
    }

    if (this.formGroup.invalid) {
      return;
    }

    this.loading = true;
    this.subscription = this.http
      .post(this.faucetUrl, { recipientAddress: this.formGroup.value.walletAddress })
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(
        response => {
          if (response) {
            this.walletService.updateBalance();
            this.dialogRef.close();
          }
        },
        err => {
          this.formGroup.controls[ 'walletAddress' ].setErrors({ server: err.error });
        }
      );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
