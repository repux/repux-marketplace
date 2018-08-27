import { Component, OnInit } from '@angular/core';
import { RepuxLibService } from '../../services/repux-lib.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KeyStoreService } from '../key-store.service';
import { MatDialogRef } from '@angular/material';
import { ValidatePassword } from '../key-store.validator';

@Component({
  selector: 'app-keys-generator-dialog',
  templateUrl: './keys-generator-dialog.component.html',
  styleUrls: [ './keys-generator-dialog.component.scss' ]
})
export class KeysGeneratorDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public noKeyStore: boolean;

  constructor(
    private fb: FormBuilder,
    private repuxLibService: RepuxLibService,
    private keyStoreService: KeyStoreService,
    private dialogRef: MatDialogRef<KeysGeneratorDialogComponent>
  ) {
    const validators = [ Validators.required ];
    if (this.keyStoreService.hasKeys()) {
      validators.push(ValidatePassword);
    }

    this.formGroup = this.fb.group({
      password: [ '', validators ]
    });
  }

  ngOnInit() {
    this.noKeyStore = !this.keyStoreService.hasKeys();
  }

  async generate() {
    if (!this.formGroup.valid) {
      return;
    }

    const password = this.formGroup.value.password;
    const keys = await this.repuxLibService.getInstance().generateAsymmetricKeyPair();

    if (!this.keyStoreService.hasKeys()) {
      this.keyStoreService.savePasswordAsHash(password);
    }

    await this.keyStoreService.storePrivateKey(keys.privateKey, password);
    this.keyStoreService.storePublicKey(keys.publicKey);

    this.dialogRef.close({
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
    });
  }
}
