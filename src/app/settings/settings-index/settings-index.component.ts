import { Component, OnDestroy, OnInit } from '@angular/core';
import { KeysPasswordDialogComponent } from '../../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeyStoreService } from '../../key-store/key-store.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';
import { saveAs } from 'file-saver';
import { KeysUpdateDialogComponent } from '../../key-store/keys-update-dialog/keys-update-dialog.component';

@Component({
  selector: 'app-settings-index',
  templateUrl: './settings-index.component.html',
  styleUrls: [ './settings-index.component.scss' ]
})
export class SettingsIndexComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  public hasKeys = false;

  constructor(private keyStoreService: KeyStoreService, private dialog: MatDialog) {
    this.hasKeys = this.keyStoreService.hasKeys();
  }

  ngOnInit() {
  }

  downloadKeys() {
    const dialogRef = this.dialog.open(KeysPasswordDialogComponent);
    this.subscription = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        saveAs(new Blob([ JSON.stringify(result.privateKey) ], { type: 'application/json' }), 'repux.pk.jwk');
        saveAs(new Blob([ JSON.stringify(result.publicKey) ], { type: 'application/json' }), 'repux.pub.jwk');
      }
    });
  }

  generateKeys() {
    const dialogRef = this.dialog.open(KeysGeneratorDialogComponent);
    this.subscription = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hasKeys = true;
      }
    });
  }

  uploadKeys() {
    const dialogRef = this.dialog.open(KeysUpdateDialogComponent);
    this.subscription = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hasKeys = true;
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
