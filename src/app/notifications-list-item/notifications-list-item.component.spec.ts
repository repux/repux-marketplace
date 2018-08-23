import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsListItemComponent } from './notifications-list-item.component';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';
import { Component, Input } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { IpfsService } from '../services/ipfs.service';
import { EulaType } from 'repux-lib';


@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: string[];
}

@Component({ selector: 'app-notifications-list-orders', template: '' })
class NotificationsListOrdersStub {
  @Input() dataProduct: DataProduct;
  @Input() displayPendingOrders: boolean;
}

describe('NotificationsListItemComponent', () => {
  let component: NotificationsListItemComponent;
  let fixture: ComponentFixture<NotificationsListItemComponent>;
  let ipfsServiceSpy = jasmine.createSpyObj('IpfsService', [ 'downloadAndSave' ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        SharedModule
      ],
      declarations: [
        MarketplaceActionButtonsStubComponent,
        NotificationsListOrdersStub,
        NotificationsListItemComponent
      ],
      providers: [
        { provide: IpfsService, useValue: ipfsServiceSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const product = new DataProduct().deserialize({
      title: 'test title',
      name: 'test name',
      category: [ 'test category 1', 'test category 2' ],
      size: 1024,
      price: '1000000000000000000',
      daysToDeliver: '1',
      fundsToWithdraw: '0',
      eula: {
        type: EulaType.OWNER,
        fileName: 'EULA',
        fileHash: 'EULA_HASH'
      }
    });

    fixture = TestBed.createComponent(NotificationsListItemComponent);
    component = fixture.componentInstance;
    component.product = product;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});