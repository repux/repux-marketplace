import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsListOrdersComponent } from './notifications-list-orders.component';
import { MaterialModule } from '../material.module';
import { OrderDatePipe } from '../shared/pipes/order-date.pipe';
import { EthTransactionLinkComponent } from '../shared/components/eth-transaction-link/eth-transaction-link.component';
import { MarketplaceFinaliseButtonComponent } from '../marketplace/marketplace-finalise-button/marketplace-finalise-button.component';

describe('NotificationsListOrdersComponent', () => {
  let component: NotificationsListOrdersComponent;
  let fixture: ComponentFixture<NotificationsListOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NotificationsListOrdersComponent,
        MarketplaceFinaliseButtonComponent,
        EthTransactionLinkComponent,
        OrderDatePipe
      ],
      imports: [
        MaterialModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsListOrdersComponent);
    component = fixture.componentInstance;
    component.blockchainDataProduct = <any> {
      disabled: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
