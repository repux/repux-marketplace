import { Component, OnInit } from '@angular/core';
import { WebpushNotificationService } from './services/webpush-notification.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/index';
import { environment } from '../environments/environment';
import { WalletService } from './services/wallet.service';
import { Router } from '@angular/router';
import { TagManagerService } from './shared/services/tag-manager.service';

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

  navLinks = [
    {
      label: 'Dashboard',
      path: 'dashboard'
    },
    {
      label: 'Marketplace',
      path: 'marketplace'
    },
    {
      label: 'Sell',
      path: 'sell'
    },
    {
      label: 'Buy',
      path: 'buy'
    }
  ];

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private webpushNotificationService: WebpushNotificationService,
    private walletService: WalletService,
    private tagManager: TagManagerService
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
      }
    });
  }
}
