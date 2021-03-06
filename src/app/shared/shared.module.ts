import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileInputComponent } from './components/file-input/file-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { FileSizePipe } from './pipes/file-size.pipe';
import { ArrayJoinPipe } from './pipes/array-join.pipe';
import { CurrencyRepuxPipe } from './pipes/currency-repux.pipe';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { MetamaskDetectorComponent } from './components/metamask-detector/metamask-detector.component';
import { MaterialModule } from '../material.module';
import { MaxFileSizeDirective } from './components/file-input/max-file-size.directive';
import { WalletInfoComponent } from './components/wallet-info/wallet-info.component';
import { EulaTypePipe } from './pipes/eula-type.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { OrderDatePipe } from './pipes/order-date.pipe';
import { PriceInputComponent } from './components/price-input/price-input.component';
import { NotificationsDetectorComponent } from './components/notifications-detector/notifications-detector.component';
import {
  NotificationsSubscriptionInstructionComponent
} from './components/notification-subscription-instruction/notifications-subscription-instruction.component';
import { BannerCookieComponent } from './components/banner-cookie/banner-cookie.component';
import { OrderRatingPipe } from './pipes/order-rating.pipe';
import { RatingStarsComponent } from './components/rating-stars/rating-stars.component';
import { BlockyIdenticonComponent } from './components/blocky-identicon/blocky-identicon.component';
import { EthTransactionLinkComponent } from './components/eth-transaction-link/eth-transaction-link.component';
import { IncentiveLeadersListComponent } from './components/incentive-leaders-list/incentive-leaders-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MaterialModule
  ],
  declarations: [
    FileInputComponent,
    MaxFileSizeDirective,
    MetamaskDetectorComponent,
    NotificationsDetectorComponent,
    ConfirmationDialogComponent,
    NotificationsSubscriptionInstructionComponent,
    WalletInfoComponent,
    ArrayJoinPipe,
    FileSizePipe,
    CurrencyRepuxPipe,
    EulaTypePipe,
    SafeHtmlPipe,
    OrderDatePipe,
    PriceInputComponent,
    OrderRatingPipe,
    RatingStarsComponent,
    BannerCookieComponent,
    BlockyIdenticonComponent,
    EthTransactionLinkComponent,
    IncentiveLeadersListComponent
  ],
  exports: [
    FileInputComponent,
    MetamaskDetectorComponent,
    NotificationsDetectorComponent,
    ConfirmationDialogComponent,
    WalletInfoComponent,
    PriceInputComponent,
    RatingStarsComponent,
    ArrayJoinPipe,
    FileSizePipe,
    CurrencyRepuxPipe,
    EulaTypePipe,
    SafeHtmlPipe,
    OrderDatePipe,
    OrderRatingPipe,
    BannerCookieComponent,
    BlockyIdenticonComponent,
    EthTransactionLinkComponent
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    NotificationsSubscriptionInstructionComponent
  ]
})
export class SharedModule {
}
