import { Component, OnInit } from '@angular/core';
import { WebpushNotificationService } from './services/webpush-notification.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { concatAll, map, reduce, scan, startWith, tap } from 'rxjs/operators';
import { Observable, merge, concat, forkJoin, combineLatest } from 'rxjs';
import { environment } from '../environments/environment';
import { WalletService } from './services/wallet.service';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { TagManagerService } from './shared/services/tag-manager.service';
import { MarketplaceProductCreatorDialogComponent } from './marketplace/marketplace-product-creator-dialog/marketplace-product-creator-dialog.component';
import { MatDialog } from '@angular/material';
import { UnpublishedProductsService } from './marketplace/services/unpublished-products.service';
import { PendingFinalisationService } from './marketplace/services/pending-finalisation.service';
import Wallet from './shared/models/wallet';
import { AwaitingFinalisationService } from './marketplace/services/awaiting-finalisation.service';
import { DataProduct } from './shared/models/data-product';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  tasksTotal$: Observable<number>;

  wallet: Wallet;

  navLinks = [
    {
      label: 'Marketplace',
      path: 'marketplace'
    },
    {
      label: 'My files',
      path: 'my-files'
    }
  ];

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private webpushNotificationService: WebpushNotificationService,
    private walletService: WalletService,
    private overlayContainer: OverlayContainer,
    private tagManager: TagManagerService,
    private dialog: MatDialog,
    private unpublishedProductsService: UnpublishedProductsService,
    private pendingFinalisationService: PendingFinalisationService,
    private awaitingFinalisationService: AwaitingFinalisationService
  ) {
  }

  ngOnInit(): void {
    this.webpushNotificationService.init();

    (<any>window).Intercom('boot', {
      app_id: environment.intercomAppId
    });

    this.walletService.getWallet().subscribe(wallet => {
      if (wallet) {
        (<any>window).Intercom('update', {
          user_id: wallet.address
        });

        this.tagManager.sendUserId(wallet.address);

        this.wallet = wallet;
      }
      this.tasksTotal$ = this.countProducts();
    });
  }

  openProductCreatorDialog() {
    this.dialog.open(MarketplaceProductCreatorDialogComponent, {
      disableClose: true
    });
  }

  countProducts(): Observable<number> {
    return combineLatest(
      this.unpublishedProductsService.getProducts(),
      this.pendingFinalisationService.getProducts(),
      this.awaitingFinalisationService.getProducts()
    )
      .pipe(
        map(result => result.reduce((acc, current) => acc + current.length, 0))
      );
  }
}
