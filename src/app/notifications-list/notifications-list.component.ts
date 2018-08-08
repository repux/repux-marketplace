import { Component, OnInit } from '@angular/core';
import { UnpublishedProductsService } from '../marketplace/services/unpublished-products.service';
import { Observable } from 'rxjs';
import { DataProduct } from '../shared/models/data-product';
import { PendingFinalisationService } from '../marketplace/services/pending-finalisation.service';
import { ReadyToDownloadService } from '../marketplace/services/ready-to-download.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: [ './notifications-list.component.scss' ]
})
export class NotificationsListComponent implements OnInit {
  public unpublishedProducts$: Observable<DataProduct[]>;
  public pendingFinalisationProducts$: Observable<DataProduct[]>;
  public readyToDownloadProducts$: Observable<DataProduct[]>;

  constructor(
    private unpublishedProductsService: UnpublishedProductsService,
    private pendingFinalisationService: PendingFinalisationService,
    private readyToDownloadService: ReadyToDownloadService
  ) {
  }

  ngOnInit() {
    this.unpublishedProducts$ = this.unpublishedProductsService.getProducts();
    this.pendingFinalisationProducts$ = this.pendingFinalisationService.getProducts();
    this.readyToDownloadProducts$ = this.readyToDownloadService.getProducts();
  }

}
