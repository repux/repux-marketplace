import { MatDialog } from '@angular/material';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketplaceSellComponent } from './marketplace-sell.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../material.module';
import {
  MarketplaceProductCreatorDialogComponent
} from './marketplace-product-creator-dialog/marketplace-product-creator-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { PendingFinalisationService } from './services/pending-finalisation.service';
import { UnpublishedProductsService } from './services/unpublished-products.service';
import { DataProduct } from '../shared/models/data-product';
import { MyActiveListingsService } from './services/my-active-listings.service';
import { DataProductTransaction } from '../shared/models/data-product-transaction';

describe('MarketplaceSellComponent', () => {
  let component: MarketplaceSellComponent;
  let fixture: ComponentFixture<MarketplaceSellComponent>;
  let matDialog, unpublishedProductsServiceSpy, pendingFinalisationServiceSpy, myActiveListingsServiceSpy;
  const dataProduct = new DataProduct();
  const dataProductTransaction = new DataProductTransaction();

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    myActiveListingsServiceSpy = jasmine.createSpyObj('MyActiveListingsService', [ 'getProducts' ]);
    myActiveListingsServiceSpy.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ dataProduct ]));

    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'getProducts' ]);
    unpublishedProductsServiceSpy.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ dataProduct ]));

    pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'getTransactions' ]);
    pendingFinalisationServiceSpy.getTransactions.and.returnValue(
      new BehaviorSubject<DataProductTransaction[]>([ dataProductTransaction ])
    );

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceSellComponent,
      ],
      imports: [
        RouterTestingModule,
        MaterialModule,
        NoopAnimationsModule,
        SharedModule
      ],
      providers: [
        { provide: MatDialog, useValue: matDialog },
        { provide: MyActiveListingsService, useValue: myActiveListingsServiceSpy },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsServiceSpy },
        { provide: PendingFinalisationService, useValue: pendingFinalisationServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceSellComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#openProductCreatorDialog()', () => {
    it('should call open on _dialog property', () => {
      component.openProductCreatorDialog();
      expect(matDialog.open.calls.count()).toBe(1);
      expect(matDialog.open.calls.allArgs()[ 0 ][ 0 ]).toEqual(MarketplaceProductCreatorDialogComponent);
    });
  });

  describe('#DOM', () => {
    it('should render all elements', () => {
      const element: HTMLElement = fixture.nativeElement;

      expect(element.querySelector('.add-product-button')).not.toBeNull();
      expect(element.querySelector('.add-product-button').getAttribute('matTooltip')).toBe('Create new product');
    });
  });
});
