import { Component, OnInit } from '@angular/core';
import { UnpublishedProductsService } from '../marketplace/services/unpublished-products.service';
import { combineLatest, Observable } from 'rxjs';
import { DataProduct } from '../shared/models/data-product';
import { PendingFinalisationService } from '../marketplace/services/pending-finalisation.service';
import { AwaitingFinalisationService } from '../marketplace/services/awaiting-finalisation.service';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: [ './notifications-list.component.scss' ]
})
export class NotificationsListComponent implements OnInit {
  unpublishedProducts$: Observable<DataProduct[]>;
  pendingFinalisationProducts$: Observable<DataProduct[]>;
  awaitingFinalisationProducts$: Observable<DataProduct[]>;
  actionButtonType = ActionButtonType;
  notificationsTotal$: Observable<number>;
  loading: boolean;

  constructor(
    private unpublishedProductsService: UnpublishedProductsService,
    private pendingFinalisationService: PendingFinalisationService,
    private awaitingFinalisationService: AwaitingFinalisationService
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.unpublishedProducts$ = this.unpublishedProductsService.getProducts();
    this.pendingFinalisationProducts$ = this.pendingFinalisationService.getProducts();
    this.awaitingFinalisationProducts$ = this.awaitingFinalisationService.getProducts();

    this.notificationsTotal$ = this.countProducts();
  }

  countProducts(): Observable<number> {
    return combineLatest(
      this.unpublishedProducts$,
      this.pendingFinalisationProducts$,
      this.awaitingFinalisationProducts$
    )
      .pipe(
        map(result => {
          this.loading = false;
          return result.reduce((acc, current) => acc + current.length, 0);
        })
      );
  }
}
