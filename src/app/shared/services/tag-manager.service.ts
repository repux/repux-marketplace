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
  FinalizeOrder= 'Finalize-order',
  FinalizeOrderConfirmed = 'Finalize-order-confirmed',
  Withdraw = 'Withdraw',
  WithdrawConfirmed = 'Withdraw-confirmed',
  Download = 'Download',
  DownloadConfirmed = 'Download-confirmed',
  CancelPendingOrder = 'Cancel-pending-order',
  CancelPendingOrderConfirmed = 'Cancel-pending-order-confirmed'
}

export interface EcommerceProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  quantity: number;
}

export interface EcommerceActionField {
  id: string;
  revenue: string;
}

export interface EcommerceData {
  actionField: EcommerceActionField;
  products: EcommerceProduct[];
}

export interface EcommerceEvent {
  currencyCode: string;
  purchase?: EcommerceData;
  originalCurrency?: string;
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

  sendEvent(category: EventCategory, action: EventAction, label: string, value: string, gasUsed?: number, ecommerceData?: EcommerceEvent)
    : void {
    this.dataLayer.push({
      event: 'custom_ga_event',
      ecommerce: ecommerceData,
      gaEventData: {
        category,
        action,
        label,
        value,
        gasUsed
      }
    });
  }
}
