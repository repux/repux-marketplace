import { Component, Input, OnDestroy } from '@angular/core';
import { DataProductTransaction as BlockchainDataProductTransaction } from 'repux-web3-api/repux-web3-api';
import { ClockService } from '../../services/clock.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';
import BigNumber from 'bignumber.js';
import { DataProductService } from '../../services/data-product.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import {
  MarketplaceRateTransactionDialogComponent
} from '../marketplace-rate-transaction-dialog/marketplace-rate-transaction-dialog.component';

@Component({
  selector: 'app-marketplace-rate-transaction-button',
  templateUrl: './marketplace-rate-transaction-button.component.html'
})
export class MarketplaceRateTransactionButtonComponent implements OnDestroy {
  @Input() dataProduct;
  @Input() blockchainBuyTransaction: BlockchainDataProductTransaction;

  private date: Date;
  private dialogSubscription: Subscription;

  constructor(
    private clockService: ClockService,
    private matDialog: MatDialog,
    private dataProductService: DataProductService,
    private commonDialogService: CommonDialogService
  ) {
    this.clockService.onEachSecond().subscribe(date => this.date = date);
  }

  get rating(): BigNumber {
    if (!this.blockchainBuyTransaction) {
      return null;
    }

    return this.blockchainBuyTransaction.rating;
  }

  get canRate(): boolean {
    if (!this.rating || !this.rating.isZero()) {
      return false;
    }

    return this.blockchainBuyTransaction.finalised && this.date <= this.blockchainBuyTransaction.rateDeadline;
  }

  ngOnDestroy(): void {
    this.unsubscribeDialogSubscription();
  }

  onDialogSubscriptionClose(result): Promise<void> {
    this.unsubscribeDialogSubscription();

    if (!result) {
      return;
    }

    return this.saveRating(result);
  }

  rateTransaction(): void {
    if (!this.canRate) {
      return;
    }

    this.unsubscribeDialogSubscription();

    this.dialogSubscription = this.matDialog.open(MarketplaceRateTransactionDialogComponent).afterClosed()
      .subscribe(result => this.onDialogSubscriptionClose(result));
  }

  saveRating(rating: BigNumber): Promise<void> {
    if (!this.canRate) {
      return;
    }

    return new Promise<void>(resolve => {
      this.commonDialogService.transaction(() =>
        this.dataProductService.rateDataProductPurchase(this.dataProduct.address, rating)
      ).afterClosed().subscribe(result => {
        if (result) {
          this.blockchainBuyTransaction.rating = rating;

          resolve();
        }
      });
    });
  }

  unsubscribeDialogSubscription() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }
}
