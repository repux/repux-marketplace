import { Component, OnInit } from '@angular/core';
import { WebpushNotificationService } from './services/webpush-notification.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/index';

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
    }
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private webpushNotificationService: WebpushNotificationService
  ) {
  }

  ngOnInit(): void {
    this.webpushNotificationService.init();
  }
}
