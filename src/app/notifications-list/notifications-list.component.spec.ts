import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsListComponent } from './notifications-list.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Input } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { PendingFinalisationService } from '../marketplace/services/pending-finalisation.service';
import { UnpublishedProductsService } from '../marketplace/services/unpublished-products.service';
import { ReadyToDownloadService } from '../marketplace/services/ready-to-download.service';

@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: string[];
}

describe('NotificationsListComponent', () => {
  let component: NotificationsListComponent;
  let fixture: ComponentFixture<NotificationsListComponent>;

  const unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'getProducts' ]);
  const pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'getProducts' ]);
  const readyToDownloadServiceSpy = jasmine.createSpyObj('ReadyToDownloadService', [ 'getProducts' ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MaterialModule,
        SharedModule
      ],
      declarations: [
        MarketplaceActionButtonsStubComponent,
        NotificationsListComponent
      ],
      providers: [
        { provide: PendingFinalisationService, useValue: pendingFinalisationServiceSpy },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsServiceSpy },
        { provide: ReadyToDownloadService, useValue: readyToDownloadServiceSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
