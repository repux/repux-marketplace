import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeysGeneratorDialogComponent } from './keys-generator-dialog/keys-generator-dialog.component';
import { KeysPasswordDialogComponent } from './keys-password-dialog/keys-password-dialog.component';
import { MatButtonModule, MatDialogModule, MatInputModule } from '@angular/material';
import { KeysUpdateDialogComponent } from './keys-update-dialog/keys-update-dialog.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    KeysGeneratorDialogComponent,
    KeysPasswordDialogComponent,
    KeysUpdateDialogComponent
  ],
  entryComponents: [
    KeysGeneratorDialogComponent,
    KeysPasswordDialogComponent,
    KeysUpdateDialogComponent
  ],
  exports: [
    KeysGeneratorDialogComponent,
    KeysPasswordDialogComponent,
    KeysUpdateDialogComponent
  ]
})
export class KeyStoreModule {
}
