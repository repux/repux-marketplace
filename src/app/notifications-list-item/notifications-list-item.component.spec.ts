import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsListItemComponent } from './notifications-list-item.component';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';
import { Component, Input } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { IpfsService } from '../services/ipfs.service';
import { EulaType } from '@repux/repux-lib';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { DataProduct as BlockchainDataProduct, DataProductOrder as BlockchainDataProductOrder } from '@repux/repux-web3-api';
import { DataProductService } from '../services/data-product.service';

@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: ActionButtonType[];
  @Input() blockchainDataProduct: BlockchainDataProduct;
  @Input() blockchainDataProductOrder: BlockchainDataProductOrder;
}

@Component({ selector: 'app-notifications-list-orders', template: '' })
class NotificationsListOrdersStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() blockchainDataProduct: BlockchainDataProduct;
  @Input() displayPendingOrders: boolean;
}

describe('NotificationsListItemComponent', () => {
  let component: NotificationsListItemComponent;
  let fixture: ComponentFixture<NotificationsListItemComponent>;
  const ipfsServiceSpy = jasmine.createSpyObj('IpfsService', [ 'downloadAndSave' ]);
  const dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'getDataProductData' ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        SharedModule
      ],
      declarations: [
        MarketplaceActionButtonsStubComponent,
        NotificationsListOrdersStubComponent,
        NotificationsListItemComponent
      ],
      providers: [
        { provide: IpfsService, useValue: ipfsServiceSpy },
        { provide: DataProductService, useValue: dataProductServiceSpy }
      ]
    }).compileComponents();
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
      creationTimestamp: 0,
      eula: {
        type: EulaType.OWNER,
        fileName: 'EULA',
        fileHash: 'EULA_HASH'
      }
    });

    fixture = TestBed.createComponent(NotificationsListItemComponent);
    component = fixture.componentInstance;
    product.creationDate = new Date();
    component.product = product;
    component.blockchainDataProduct = <any> {
      disabled: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
