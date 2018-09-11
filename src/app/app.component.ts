import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { environment } from '../environments/environment';
import { WalletService } from './services/wallet.service';
import { ActivatedRoute } from '@angular/router';
import { TagManagerService } from './shared/services/tag-manager.service';
// tslint:disable-next-line:max-line-length
import { MarketplaceProductCreatorDialogComponent } from './marketplace/marketplace-product-creator-dialog/marketplace-product-creator-dialog.component';
import { MatDialog } from '@angular/material';
import { UnpublishedProductsService } from './marketplace/services/unpublished-products.service';
import { PendingFinalisationService } from './marketplace/services/pending-finalisation.service';
import Wallet from './shared/models/wallet';
import { AwaitingFinalisationService } from './marketplace/services/awaiting-finalisation.service';
import { MarketplaceAnalyticsDialogComponent } from './marketplace/marketplace-analytics-dialog/marketplace-analytics-dialog.component';
import { OAuthState } from './shared/enums/oauth-state';
// tslint:disable-next-line:max-line-length
import { MarketplaceProductCreatorAnalyticsDialogComponent } from './marketplace/marketplace-product-creator-analytics-dialog/marketplace-product-creator-analytics-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([
    Breakpoints.Handset,
    Breakpoints.Tablet
  ])
    .pipe(
      map(result => result.matches)
    );

  tasksTotal$: Observable<number>;
  wallet: Wallet;
  faucetUrl: String;

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
    private activatedRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private walletService: WalletService,
    private tagManager: TagManagerService,
    private dialog: MatDialog,
    private unpublishedProductsService: UnpublishedProductsService,
    private pendingFinalisationService: PendingFinalisationService,
    private awaitingFinalisationService: AwaitingFinalisationService
  ) {
  }

  ngOnInit(): void {
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
      this.faucetUrl = environment.faucetUrl;
    });

    this.activatedRoute.fragment
      .pipe(filter(fragment => fragment && fragment.includes('access_token')))
      .subscribe(routeFragment => {
        this.resolveOauthUrl(new URLSearchParams(routeFragment));
    });
  }

  openProductCreatorDialog() {
    this.dialog.open(MarketplaceProductCreatorDialogComponent, {
      disableClose: true
    });
  }

  openAnalyticsIntegrationDialog() {
    this.dialog.open(MarketplaceAnalyticsDialogComponent, {
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

  resolveOauthUrl(params: URLSearchParams) {
    const state = parseInt(params.get('state'), 10);

    if (state === OAuthState.AnalyticsIntegration) {
      const dialogRef = this.dialog.open(MarketplaceProductCreatorAnalyticsDialogComponent, {
        disableClose: true
      });
      dialogRef.componentInstance.accessToken = params.get('access_token');
    }
  }
}
