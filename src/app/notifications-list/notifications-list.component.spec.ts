import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsListComponent } from './notifications-list.component';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Input } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { PendingFinalisationService } from '../marketplace/services/pending-finalisation.service';
import { UnpublishedProductsService } from '../marketplace/services/unpublished-products.service';
import { HttpClient } from '@angular/common/http';
import { AwaitingFinalisationService } from '../marketplace/services/awaiting-finalisation.service';
import { ActionButtonType } from '../shared/enums/action-button-type';

@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: ActionButtonType[];
}

@Component({ selector: 'app-notifications-list-item', template: '' })
class NotificationsListItemStub {
  @Input() actions: string[];
  @Input() product: DataProduct;
  @Input() showOrders: boolean;
  @Input() showMyOrderData: boolean;
}

describe('NotificationsListComponent', () => {
  let component: NotificationsListComponent;
  let fixture: ComponentFixture<NotificationsListComponent>;

  const unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'getProducts' ]);
  const pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'getProducts' ]);
  const awaitingFinalisationService = jasmine.createSpyObj('AwaitingFinalisationService', [ 'getProducts' ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MaterialModule,
        SharedModule
      ],
      declarations: [
        MarketplaceActionButtonsStubComponent,
        NotificationsListComponent,
        NotificationsListItemStub
      ],
      providers: [
        { provide: PendingFinalisationService, useValue: pendingFinalisationServiceSpy },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsServiceSpy },
        { provide: AwaitingFinalisationService, useValue: awaitingFinalisationService },
        { provide: HttpClient, useValue: jasmine.createSpy() },
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
