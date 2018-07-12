import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileInputComponent } from './components/file-input/file-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { FileSizePipe } from './pipes/file-size.pipe';
import { ArrayJoinPipe } from './pipes/array-join.pipe';
import { CurrencyRepuxPipe } from './pipes/currency-repux';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { TransactionDialogComponent } from './components/transaction-dialog/transaction-dialog.component';
import { MetamaskDetectorComponent } from './components/metamask-detector/metamask-detector.component';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';
import { MaterialModule } from '../material.module';
import { NotificationsNumberComponent } from './components/notifications-number/notifications-number.component';
import { MaxFileSizeDirective } from './components/file-input/max-file-size.directive';

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
    ConfirmationDialogComponent,
    TransactionDialogComponent,
    TaskManagerComponent,
    NotificationsNumberComponent,
    ArrayJoinPipe,
    FileSizePipe,
    CurrencyRepuxPipe
  ],
  exports: [
    FileInputComponent,
    MetamaskDetectorComponent,
    ConfirmationDialogComponent,
    TransactionDialogComponent,
    TaskManagerComponent,
    NotificationsNumberComponent,
    ArrayJoinPipe,
    FileSizePipe,
    CurrencyRepuxPipe
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    TransactionDialogComponent,
    TaskManagerComponent
  ]
})
export class SharedModule {
}
