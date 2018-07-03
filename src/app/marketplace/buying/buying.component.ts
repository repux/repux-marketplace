import { Component, OnDestroy } from '@angular/core';
import { DataProductNotificationsService } from '../../services/data-product-notifications.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-buying',
  templateUrl: './buying.component.html',
  styleUrls: [ './buying.component.scss' ]
})
export class BuyingComponent implements OnDestroy {
  navLinks = [
    {
      label: 'Ready to download',
      path: 'ready-to-download',
      items: []
    },
    {
      label: 'Awaiting finalisation',
      path: 'awaiting-finalisation',
      items: []
    }
  ];

  private _awaitingFinalisationSubscription: Subscription;

  constructor(
    private _dataProductNotificationsService: DataProductNotificationsService
  ) {
    this._awaitingFinalisationSubscription = this._dataProductNotificationsService.getAwaitingFinalisation()
      .subscribe(awaitingFinalisation => {
        this.navLinks.find(link => link.path === 'awaiting-finalisation').items = awaitingFinalisation;
      });

  }

  ngOnDestroy() {
    if (this._awaitingFinalisationSubscription) {
      this._awaitingFinalisationSubscription.unsubscribe();
    }
  }
}
