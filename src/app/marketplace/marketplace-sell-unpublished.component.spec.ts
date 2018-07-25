import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MarketplaceSellUnpublishedComponent } from './marketplace-sell-unpublished.component';
import { Component, Input } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { UnpublishedProductsService } from './services/unpublished-products.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() availableActions: string[];
  @Input() dataProducts: DataProduct[];
  @Input() displayedColumns: string[];
  @Input() showFilters: boolean;
  @Input() showPaginator: boolean;
  @Input() showSearch: boolean;
}

describe('MarketplaceSellUnpublishedComponent', () => {
  let component: MarketplaceSellUnpublishedComponent;
  let fixture: ComponentFixture<MarketplaceSellUnpublishedComponent>;
  let unpublishedProductsService;
  const dataProduct = new DataProduct();

  beforeEach(fakeAsync(() => {
    unpublishedProductsService = jasmine.createSpyObj('UnpublishedProductsService', [ 'getProducts' ]);
    unpublishedProductsService.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ dataProduct ]));

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceSellUnpublishedComponent,
        DataProductListStubComponent
      ],
      providers: [
        { provide: UnpublishedProductsService, useValue: unpublishedProductsService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceSellUnpublishedComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#get dataProducts()', () => {
    it('should return products array from unpublishedProductsService', () => {
      expect(component.dataProducts).toEqual([ dataProduct ]);
    });
  });
});
