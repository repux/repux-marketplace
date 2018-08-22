import { Component } from '@angular/core';
import { MyActiveListingsService } from './services/my-active-listings.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReadyToDownloadService } from './services/ready-to-download.service';

@Component({
  selector: 'app-marketplace-my-files',
  templateUrl: './marketplace-my-files.component.html',
  styleUrls: ['./marketplace-my-files.component.scss']
})
export class MarketplaceMyFilesComponent {
  navLinks = [
    {
      label: 'Active listings',
      path: 'active-listings',
      notifications$: new Observable()
    },
    {
      label: 'Files to download',
      path: 'files-to-download',
      notifications$: new Observable()
    }
  ];

  constructor(
    private myActiveListingsService: MyActiveListingsService,
    private readyToDownloadService: ReadyToDownloadService,
  ) {
    this.navLinks[0].notifications$ = this.myActiveListingsService.getProducts()
      .pipe(
        map(products => products.length)
      );

    this.navLinks[1].notifications$ = this.readyToDownloadService.getProducts()
      .pipe(
        map(products => products.length)
      );
  }
}
