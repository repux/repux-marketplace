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
    FileSizePipe
  ],
  exports: [
    FileInputComponent,
    ArrayJoinPipe,
    FileSizePipe
  ]
})
export class SharedModule {
}
