import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketplaceSellComponent } from './marketplace-sell.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { PendingFinalisationService } from './services/pending-finalisation.service';
import { UnpublishedProductsService } from './services/unpublished-products.service';
import { DataProduct } from '../shared/models/data-product';
import { MyActiveListingsService } from './services/my-active-listings.service';
import { DataProductOrder } from '../shared/models/data-product-order';

describe('MarketplaceSellComponent', () => {
  let component: MarketplaceSellComponent;
  let fixture: ComponentFixture<MarketplaceSellComponent>;
  let unpublishedProductsServiceSpy, pendingFinalisationServiceSpy, myActiveListingsServiceSpy;
  const dataProduct = new DataProduct();
  const dataProductOrder = new DataProductOrder();

  beforeEach(fakeAsync(() => {

    myActiveListingsServiceSpy = jasmine.createSpyObj('MyActiveListingsService', [ 'getProducts' ]);
    myActiveListingsServiceSpy.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ dataProduct ]));

    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'getProducts' ]);
    unpublishedProductsServiceSpy.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ dataProduct ]));

    pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'getOrders' ]);
    pendingFinalisationServiceSpy.getOrders.and.returnValue(
      new BehaviorSubject<DataProductOrder[]>([ dataProductOrder ])
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
});
