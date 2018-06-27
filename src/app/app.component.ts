import { Component, OnInit } from '@angular/core';
import { DataProductNotificationsService } from './services/data-product-notifications.service';
import { WebpushNotificationService } from './services/webpush-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
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
    private _dataProductNotificationService: DataProductNotificationsService,
    private _webpushNotificationService: WebpushNotificationService
  ) {
  }

  ngOnInit(): void {
    this._webpushNotificationService.init();
  }
}
