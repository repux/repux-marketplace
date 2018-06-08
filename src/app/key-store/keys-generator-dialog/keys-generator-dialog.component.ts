import { Component, OnInit } from '@angular/core';
import { RepuxLibService } from '../../services/repux-lib.service';
import { FormControl, FormGroup } from '@angular/forms';
import { KeyStoreService } from '../key-store.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-keys-generator-dialog',
  templateUrl: './keys-generator-dialog.component.html',
  styleUrls: [ './keys-generator-dialog.component.scss' ]
})
export class KeysGeneratorDialogComponent implements OnInit {
  public formGroup: FormGroup;

  constructor(
    private repuxLibService: RepuxLibService,
    private keyStoreService: KeyStoreService,
    private dialogRef: MatDialogRef<KeysGeneratorDialogComponent>
  ) {
    this.formGroup = new FormGroup({
      password: new FormControl()
    });
  }

  ngOnInit() {
  }

  async generate() {
    if (!this.formGroup.valid) {
      return;
    }

    const password = this.formGroup.value.password;
    const keys = await this.repuxLibService.getClass().generateAsymmetricKeyPair();

    this.keyStoreService.savePasswordAsHash(password);
    await this.keyStoreService.store(KeyStoreService.PRIVATE_KEY, keys.privateKey, password);
    await this.keyStoreService.store(KeyStoreService.PUBLIC_KEY, keys.publicKey, password);

    this.dialogRef.close({
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
    });
  }
}
