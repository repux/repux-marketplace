import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-banner-testnet',
  templateUrl: './banner-testnet.component.html',
  styleUrls: [ './banner-testnet.component.scss' ]
})
export class BannerTestnetComponent implements OnInit {
  static storageKey = 'banner_testnet_dismissed';
  show = false;

  constructor(private storageService: StorageService) {
  }

  ngOnInit() {
    const isDismissed = this.storageService.getItem(BannerTestnetComponent.storageKey);
    if (!isDismissed) {
      this.show = true;
    }
  }

  dismiss() {
    this.show = false;
    this.storageService.setItem(BannerTestnetComponent.storageKey, 1);
  }
}
