import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MarketplaceSellUnpublishedComponent } from './marketplace-sell-unpublished.component';
import { Component, Input } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { UnpublishedProductsService } from '../services/unpublished-products.service';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() dataProducts: DataProduct[];
  @Input() availableActions: string[];
  @Input() showPaginator: boolean;
  @Input() showSearch: boolean;
  @Input() showFilters: boolean;
}

describe('MarketplaceSellUnpublishedComponent', () => {
  let component: MarketplaceSellUnpublishedComponent;
  let fixture: ComponentFixture<MarketplaceSellUnpublishedComponent>;
  let unpublishedProductsService;

  beforeEach(fakeAsync(() => {
    unpublishedProductsService = {
      products: [ 'DATA_PRODUCT' ]
    };
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
      expect(component.dataProducts).toEqual(<any> [ 'DATA_PRODUCT' ]);
    });
  });
});
