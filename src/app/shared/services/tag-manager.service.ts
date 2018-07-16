import { Injectable } from '@angular/core';


export enum EventCategory {
  Sell = 'Sell',
  Buy = 'Buy'
}

export enum EventAction {
  CreateDataProduct = 'Create-data-product',
  CreateConfirmedDataProduct = 'Create-confirmed-data-product',
  CreateDataProductCancel = 'Create-data-product-cancel',
  PublishButton = 'Publish-button',
  PublishButtonConfirmed = 'Publish-button-confirmed',
  RemoveUnpublished = 'Remove-unpublished',
  RemoveUnpublishedConfirmed = 'Remove-unpublished-confirmed',
  UnpublishButton = 'Unpublish-button',
  UnpublishConfirmed = 'Unpublish-confirmed',
  Buy = 'Buy',
  BuyConfirmed = 'Buy-confirmed',
  FinalizeTransaction = 'Finalize-transaction',
  FinalizeTransactionConfirmed = 'Finalize-transaction-confirmed',
  Withdraw = 'Withdraw',
  WithdrawConfirmed = 'Withdraw-confirmed',
  Download = 'Download',
  DownloadConfirmed = 'Download-confirmed',
  CancelPendingTransaction = 'Cancel-pending-transaction',
  CancelPendingTransactionConfirmed = 'Cancel-pending-transaction-confirmed'
}

@Injectable({
  providedIn: 'root'
})
export class TagManagerService {

  private dataLayer;

  constructor() {
    this.dataLayer = (<any>window).dataLayer || [];
  }

  sendUserId(userId: string): void {
    this.dataLayer.push({
      userId
    });
  }

  sendEvent(category: EventCategory, action: EventAction, label: string, value: string): void {
    this.dataLayer.push({
      event: 'custom_ga_event',
      gaEventData: {
        category,
        action,
        label,
        value
      }
    });
  }
}
