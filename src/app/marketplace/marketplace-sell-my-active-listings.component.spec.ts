import { MatDialog } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MarketplaceSellMyActiveListingsComponent } from './marketplace-sell-my-active-listings.component';
import Wallet from '../shared/models/wallet';
import { Component, Input } from '@angular/core';
import { MaterialModule } from '../material.module';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() staticQuery: {};
  @Input() displayedColumns: string[];
  @Input() availableActions: string[];
}

describe('MarketplaceSellMyActiveListingsComponent', () => {
  let component: MarketplaceSellMyActiveListingsComponent;
  let fixture: ComponentFixture<MarketplaceSellMyActiveListingsComponent>;
  let matDialog;
  const ownerAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceSellMyActiveListingsComponent,
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

    fixture = TestBed.createComponent(MarketplaceSellMyActiveListingsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#_onWalletChange()', () => {
    it('should set wallet and staticQuery', () => {
      expect((<any> component.staticQuery).bool.must[ 0 ].match.ownerAddress).toBe('');
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
      expect((<any> component.staticQuery).bool.must[ 0 ].match.ownerAddress).toBe(ownerAddress);
    });
  });

  describe('#DOM', () => {
    it('should render all elements', () => {
      const element: HTMLElement = fixture.nativeElement;
      const dataProductList = element.querySelector('app-data-product-list');

      expect(dataProductList).not.toBeNull();
    });
  });
});
