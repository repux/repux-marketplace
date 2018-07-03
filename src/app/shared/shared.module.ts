import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileInputComponent } from './components/file-input/file-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';
import { FileSizePipe } from './pipes/file-size.pipe';
import { ArrayJoinPipe } from './pipes/array-join.pipe';
import { CurrencyRepuxPipe } from './pipes/currency-repux';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
    FileInputComponent,
    ArrayJoinPipe,
    FileSizePipe,
    CurrencyRepuxPipe
  ],
  exports: [
    FileInputComponent,
    ArrayJoinPipe,
    FileSizePipe,
    CurrencyRepuxPipe
  ]
})
export class SharedModule {
}
