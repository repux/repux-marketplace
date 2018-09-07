import { MatDialog } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MarketplaceActiveListingsComponent } from './marketplace-active-listings.component';
import Wallet from '../shared/models/wallet';
import { Component, Input } from '@angular/core';
import { MaterialModule } from '../material.module';
import { getCreatedDataProductsQuery } from './services/my-active-listings.service';
import { ActionButtonType } from '../shared/enums/action-button-type';
import BigNumber from 'bignumber.js';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() staticQuery: {};
  @Input() displayedColumns: string[];
  @Input() availableActions: ActionButtonType[];
  @Input() defaultSort: {};
}

describe('MarketplaceSellMyActiveListingsComponent', () => {
  let component: MarketplaceActiveListingsComponent;
  let fixture: ComponentFixture<MarketplaceActiveListingsComponent>;
  let matDialog;
  const ownerAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceActiveListingsComponent,
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

    fixture = TestBed.createComponent(MarketplaceActiveListingsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#_onWalletChange()', () => {
    it('should set wallet and staticQuery', () => {
      expect(component.staticQuery).toEqual(getCreatedDataProductsQuery(''));
      const wallet = new Wallet(ownerAddress, new BigNumber(0));
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](null);
      expect(component[ '_wallet' ]).toBe(wallet);
      const wallet2 = new Wallet(ownerAddress, new BigNumber(0));
      component[ '_onWalletChange' ](wallet2);
      expect(component[ '_wallet' ]).toBe(wallet2);
      expect(component.staticQuery).toEqual(getCreatedDataProductsQuery(ownerAddress));
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
