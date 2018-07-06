import { Component, OnInit, ViewChild } from '@angular/core';
import { RepuxLibService } from '../../services/repux-lib.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { KeyStoreService } from '../key-store.service';
import { MatDialogRef } from '@angular/material';
import { FileInputComponent } from '../../shared/components/file-input/file-input.component';
import { fileToString } from '../../shared/utils/file-to-string';
import { ValidatePassword } from '../key-store.validator';

@Component({
  selector: 'app-keys-update-dialog',
  templateUrl: './keys-update-dialog.component.html',
  styleUrls: [ './keys-update-dialog.component.scss' ]
})
export class KeysUpdateDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public filePrivateKeyFormControl = new FormControl('', [
    Validators.required
  ]);
  public filePublicKeyFormControl = new FormControl('', [
    Validators.required
  ]);
  public noKeyStore: boolean;

  @ViewChild('filePrivateKeyInput') filePrivateKeyInput: FileInputComponent;
  @ViewChild('filePublicKeyInput') filePublicKeyInput: FileInputComponent;

  constructor(
    private fb: FormBuilder,
    private repuxLibService: RepuxLibService,
    private keyStoreService: KeyStoreService,
    private dialogRef: MatDialogRef<KeysUpdateDialogComponent>
  ) {
    const validators = [ Validators.required ];
    if (this.keyStoreService.hasKeys()) {
      validators.push(ValidatePassword);
    }

    this.formGroup = this.fb.group({
      filePrivateKey: this.filePrivateKeyFormControl,
      filePublicKey: this.filePublicKeyFormControl,
      password: [ '', validators ]
    });
  }

  ngOnInit() {
    this.noKeyStore = !this.keyStoreService.hasKeys();
  }

  async upload() {
    if (!this.formGroup.valid) {
      return;
    }

    const password = this.formGroup.value.password;
    const privateKeyString = await fileToString(this.filePrivateKeyInput.value[ 0 ]);
    const publicKeyString = await fileToString(this.filePublicKeyInput.value[ 0 ]);
    const privateKey = JSON.parse(privateKeyString) as JsonWebKey;
    const publicKey = JSON.parse(publicKeyString) as JsonWebKey;

    if (!this.keyStoreService.hasKeys()) {
      this.keyStoreService.savePasswordAsHash(password);
    }

    await this.keyStoreService.store(KeyStoreService.PRIVATE_KEY, privateKey, password);
    await this.keyStoreService.store(KeyStoreService.PUBLIC_KEY, publicKey, password);

    this.dialogRef.close({
      publicKey,
      privateKey
    });
  }
}
