import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeysGeneratorDialogComponent } from './keys-generator-dialog/keys-generator-dialog.component';
import { KeysPasswordDialogComponent } from './keys-password-dialog/keys-password-dialog.component';
import { MatButtonModule, MatDialogModule, MatInputModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    KeysGeneratorDialogComponent,
    KeysPasswordDialogComponent
  ],
  entryComponents: [
    KeysGeneratorDialogComponent,
    KeysPasswordDialogComponent
  ],
  exports: [
    KeysGeneratorDialogComponent,
    KeysPasswordDialogComponent
  ]
})
export class KeyStoreModule { }
