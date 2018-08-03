import { MatDialog } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MarketplaceSellPendingFinalisationComponent } from './marketplace-sell-pending-finalisation.component';
import Wallet from '../shared/models/wallet';
import { Component, Input } from '@angular/core';
import { MaterialModule } from '../material.module';
import { getPendingFinalisationDataProductsQuery } from './services/pending-finalisation.service';
import { ActionButtonType } from '../shared/enums/action-button-type';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() staticQuery: {};
  @Input() displayedColumns: string[];
  @Input() availableActions: ActionButtonType[];
  @Input() displayPendingOrders: boolean;
  @Input() disablePendingFinalisation: boolean;
}

describe('MarketplaceSellPendingFinalisationComponent', () => {
  let component: MarketplaceSellPendingFinalisationComponent;
  let fixture: ComponentFixture<MarketplaceSellPendingFinalisationComponent>;
  let matDialog;
  const ownerAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceSellPendingFinalisationComponent,
        DataProductListStubComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialog, useValue: matDialog }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceSellPendingFinalisationComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#_onWalletChange()', () => {
    it('should set wallet and staticQuery', () => {
      expect(component.staticQuery).toEqual(getPendingFinalisationDataProductsQuery(''));
      const wallet = new Wallet(ownerAddress, 0);
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](null);
      expect(component[ '_wallet' ]).toBe(wallet);
      const wallet2 = new Wallet(ownerAddress, 0);
      component[ '_onWalletChange' ](wallet2);
      expect(component[ '_wallet' ]).toBe(wallet2);
      expect(component.staticQuery).toEqual(getPendingFinalisationDataProductsQuery(ownerAddress));
    });
  });

  describe('#DOM', () => {
    it('should render all elements', () => {
      const element: HTMLElement = fixture.nativeElement;

      expect(element.querySelector('app-data-product-list')).not.toBeNull();
    });
  });
});
