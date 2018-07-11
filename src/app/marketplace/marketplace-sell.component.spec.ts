import { MatDialog } from '@angular/material';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketplaceSellComponent } from './marketplace-sell.component';
import { DataProductNotificationsService } from '../services/data-product-notifications.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../material.module';
import {
  MarketplaceProductCreatorDialogComponent
} from './marketplace-product-creator-dialog/marketplace-product-creator-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { PendingFinalisationService } from '../services/data-product-notifications/pending-finalisation.service';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import { DataProduct } from '../shared/models/data-product';

describe('MarketplaceSellComponent', () => {
  let component: MarketplaceSellComponent;
  let fixture: ComponentFixture<MarketplaceSellComponent>;
  let matDialog, dataProductNotificationsService, unpublishedProductsService, pendingFinalisationService;
  const dataProductAddress = '0x00';
  const dataProduct = new DataProduct();

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    dataProductNotificationsService = jasmine.createSpyObj('DataProductNotificationsService', [ 'getCreatedProductsAddresses' ]);
    dataProductNotificationsService.getCreatedProductsAddresses.and.returnValue(new BehaviorSubject<string[]>([ dataProductAddress ]));

    unpublishedProductsService = jasmine.createSpyObj('UnpublishedProductsService', [ 'getProducts' ]);
    unpublishedProductsService.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ dataProduct ]));

    pendingFinalisationService = jasmine.createSpyObj('PendingFinalisationService', [ 'getEntries' ]);
    pendingFinalisationService.getEntries.and.returnValue(new BehaviorSubject<DataProduct[]>([ dataProduct ]));

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
        { provide: DataProductNotificationsService, useValue: dataProductNotificationsService },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsService },
        { provide: PendingFinalisationService, useValue: pendingFinalisationService }
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
