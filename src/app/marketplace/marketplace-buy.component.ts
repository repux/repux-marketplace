import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { ReadyToDownloadService } from '../services/data-product-notifications/ready-to-download.service';
import { AwaitingFinalisationService } from '../services/data-product-notifications/awaiting-finalisation.service';

export enum MarketplaceBuyingLink {
  READY_TO_DOWNLOAD = 'ready-to-download',
  AWAITING_FINALISATION = 'awaiting-finalisation'
}

@Component({
  selector: 'app-marketplace-buy',
  templateUrl: './marketplace-buy.component.html',
  styleUrls: [ './marketplace-buy.component.scss' ]
})
export class MarketplaceBuyComponent implements OnDestroy {
  navLinks = [
    {
      label: 'Ready to download',
      path: MarketplaceBuyingLink.READY_TO_DOWNLOAD,
      items: []
    },
    {
      label: 'Awaiting finalisation',
      path: MarketplaceBuyingLink.AWAITING_FINALISATION,
      items: []
    }
  ];

  private readonly _awaitingFinalisationSubscription: Subscription;
  private readonly _finalisedSubscription: Subscription;
  private _awaitingFinalisationLink;
  private _readyToDownloadLink;

  constructor(
    private _awaitingFinalisationService: AwaitingFinalisationService,
    private _readyToDownloadService: ReadyToDownloadService
  ) {
    this._awaitingFinalisationLink = this.navLinks.find(link => link.path === MarketplaceBuyingLink.AWAITING_FINALISATION);
    this._readyToDownloadLink = this.navLinks.find(link => link.path === MarketplaceBuyingLink.READY_TO_DOWNLOAD);

    this._awaitingFinalisationSubscription = this._awaitingFinalisationService.getEntries()
      .subscribe(awaitingFinalisation => this._awaitingFinalisationLink.items = awaitingFinalisation);

    this._awaitingFinalisationSubscription = this._readyToDownloadService.getEntries()
      .subscribe(finalised => this._readyToDownloadLink.items = finalised);
  }

  ngOnDestroy() {
    if (this._awaitingFinalisationSubscription) {
      this._awaitingFinalisationSubscription.unsubscribe();
    }

    if (this._finalisedSubscription) {
      this._finalisedSubscription.unsubscribe();
    }
  }
}
