import { Component, OnDestroy, OnInit } from '@angular/core';
import { KeysPasswordDialogComponent } from '../../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { KeyStoreService } from '../../key-store/key-store.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';
import { saveAs } from 'file-saver';
import { KeysUpdateDialogComponent } from '../../key-store/keys-update-dialog/keys-update-dialog.component';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import Wallet from '../../shared/models/wallet';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-settings-index',
  templateUrl: './settings-index.component.html',
  styleUrls: [ './settings-index.component.scss' ]
})
export class SettingsIndexComponent implements OnInit, OnDestroy {
  wallet$: Observable<Wallet>;
  private subscription: Subscription;
  public hasKeys = false;

  constructor(
    private keyStoreService: KeyStoreService,
    private walletService: WalletService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.hasKeys = this.keyStoreService.hasKeys();
    router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const element = document.querySelector('#' + tree.fragment);
          if (element) {
            setTimeout(() => {
              element.scrollIntoView(true);
            });
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.wallet$ = this.walletService.getWallet();
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
