import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { environment } from '../../../environments/environment';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-marketplace-rate-order-dialog',
  styleUrls: [ './marketplace-rate-order-dialog.component.scss' ],
  templateUrl: './marketplace-rate-order-dialog.component.html',
})
export class MarketplaceRateOrderDialogComponent {
  @Input() daysToRate = environment.repux.maxDaysToRate;
  @Input() rating = new BigNumber(0);
  @Input() minRate = environment.repux.minProductRate;
  @Input() maxRate = environment.repux.maxProductRate;
  @ViewChild('stars', { read: ElementRef }) stars: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<MarketplaceRateOrderDialogComponent>
  ) {
  }

  get availableRates() {
    return Array.from(Array(this.maxRate - this.minRate + 1).keys()).map(key => key + this.minRate);
  }

  setRating(rate: number) {
    if (rate > this.maxRate || rate < this.minRate) {
      return;
    }

    this.rating = new BigNumber(rate);
  }

  closeWithSuccess() {
    this.dialogRef.close(this.rating);
  }
}
