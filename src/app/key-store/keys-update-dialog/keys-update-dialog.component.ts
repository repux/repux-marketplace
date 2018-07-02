import { Component, OnInit, ViewChild } from '@angular/core';
import { RepuxLibService } from '../../services/repux-lib.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { KeyStoreService } from '../key-store.service';
import { MatDialogRef } from '@angular/material';
import { FileInputComponent } from '../../shared/components/file-input/file-input.component';
import { fileToString } from '../../shared/utils/file-to-string';

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

  @ViewChild('filePrivateKeyInput') filePrivateKeyInput: FileInputComponent;
  @ViewChild('filePublicKeyInput') filePublicKeyInput: FileInputComponent;

  constructor(
    private repuxLibService: RepuxLibService,
    private keyStoreService: KeyStoreService,
    private dialogRef: MatDialogRef<KeysUpdateDialogComponent>
  ) {
    this.formGroup = new FormGroup({
      password: new FormControl(),
      filePrivateKey: this.filePrivateKeyFormControl,
      filePublicKey: this.filePublicKeyFormControl
    });
  }

  ngOnInit() {
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

    this.keyStoreService.savePasswordAsHash(password);
    await this.keyStoreService.store(KeyStoreService.PRIVATE_KEY, privateKey, password);
    await this.keyStoreService.store(KeyStoreService.PUBLIC_KEY, publicKey, password);

    this.dialogRef.close({
      publicKey,
      privateKey
    });
  }
}
