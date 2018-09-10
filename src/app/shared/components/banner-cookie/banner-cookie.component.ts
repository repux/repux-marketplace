import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-banner-cookie',
  templateUrl: './banner-cookie.component.html',
  styleUrls: [ './banner-cookie.component.scss' ]
})
export class BannerCookieComponent implements OnInit {
  static storageKey = 'banner_cookie_dismissed';
  show = false;
  cookiePolicyUrl = environment.cookiePolicyUrl;

  constructor(private storageService: StorageService) {
  }

  ngOnInit() {
    const isDismissed = this.storageService.getItem(BannerCookieComponent.storageKey);
    if (!isDismissed) {
      this.show = true;
    }
  }

  dismiss() {
    this.show = false;
    this.storageService.setItem(BannerCookieComponent.storageKey, 1);
  }
}
