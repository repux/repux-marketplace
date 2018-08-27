import { MatDialog } from '@angular/material';
import { Injectable } from '@angular/core';
import { KeysPasswordDialogComponent } from './keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from './keys-generator-dialog/keys-generator-dialog.component';
import { KeyStoreService } from './key-store.service';

@Injectable({
  providedIn: 'root'
})
export class KeyStoreDialogService {
  constructor(
    private dialog: MatDialog,
    private keyStoreService: KeyStoreService
  ) {
  }

  getKeys(options: { privateKey?: boolean, publicKey?: boolean } = {}): Promise<{ privateKey?: JsonWebKey, publicKey?: JsonWebKey }> {
    return new Promise(resolve => {
      let dialogRef;

      if (this.keyStoreService.hasKeys()) {
        if (!options.privateKey && options.publicKey) {
          return resolve({
            publicKey: this.keyStoreService.getPublicKey()
          });
        }

        dialogRef = this.dialog.open(KeysPasswordDialogComponent);
      } else {
        dialogRef = this.dialog.open(KeysGeneratorDialogComponent);
      }

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve({
            privateKey: result.privateKey,
            publicKey: result.publicKey
          });
        }
      });
    });
  }
}
