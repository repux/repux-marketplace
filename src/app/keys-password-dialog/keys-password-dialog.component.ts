import { Component, OnInit } from '@angular/core';
import { KeysGeneratorDialogComponent } from '../keys-generator-dialog/keys-generator-dialog.component';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { KeyStoreService } from '../services/key-store.service';

function ValidateEmail(c: FormControl) {
  return KeyStoreService.isPasswordValid(c.value) ? null : {
    validatePassword: {
      valid: false
    }
  };
}

@Component({
  selector: 'app-keys-password-dialog',
  templateUrl: './keys-password-dialog.component.html',
  styleUrls: [ './keys-password-dialog.component.scss' ]
})
export class KeysPasswordDialogComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private keyStoreService: KeyStoreService,
    private dialogRef: MatDialogRef<KeysGeneratorDialogComponent>
  ) {
    this.formGroup = this.fb.group({
      password: [ '', [ Validators.required, ValidateEmail ] ]
    });
  }

  ngOnInit() {
  }

  async authorize() {
    if (!this.formGroup.valid) {
      return;
    }

    const password = this.formGroup.value.password;
    const keys = await this.keyStoreService.getKeys(password);

    this.dialogRef.close({
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
    });
  }
}
