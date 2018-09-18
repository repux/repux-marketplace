import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { environment } from '../../../../environments/environment.base';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WalletService } from '../../../services/wallet.service';
import { finalize } from 'rxjs/operators';
import { RepuxWeb3Service } from '../../../services/repux-web3.service';

@Component({
  selector: 'app-issue-demo-tokens',
  templateUrl: './issue-demo-tokens.component.html',
  styleUrls: [ './issue-demo-tokens.component.scss' ]
})
export class IssueDemoTokensComponent implements OnInit, OnDestroy {
  formGroup: FormGroup;
  error: string;
  loading = false;

  private faucetUrl = environment.faucetUrl + '/issue-demo-token';
  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<IssueDemoTokensComponent>,
    private walletService: WalletService,
    private repuxWeb3Service: RepuxWeb3Service
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

  async setAccountAddress(): Promise<void> {
    const web3Service: RepuxWeb3Service = await this.repuxWeb3Service;
    const repuxApi = await web3Service.getRepuxApiInstance();
    const accountAddress = await repuxApi.getDefaultAccount();
    this.formGroup.controls[ 'walletAddress' ].setValue(accountAddress);
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

  ngOnInit(): Promise<void> {
    return this.setAccountAddress();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
