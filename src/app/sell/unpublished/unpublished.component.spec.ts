import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { UnpublishedComponent } from './unpublished.component';
import { Component, Input } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { UnpublishedProductsService } from '../../services/unpublished-products.service';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() dataProducts: DataProduct[];
  @Input() availableActions: string[];
  @Input() showPaginator: boolean;
  @Input() showSearch: boolean;
  @Input() showFilters: boolean;
}

describe('UnpublishedComponent', () => {
  let component: UnpublishedComponent;
  let fixture: ComponentFixture<UnpublishedComponent>;
  let unpublishedProductsService;

  beforeEach(fakeAsync(() => {
    unpublishedProductsService = {
      products: [ 'DATA_PRODUCT' ]
    };
    TestBed.configureTestingModule({
      declarations: [
        UnpublishedComponent,
        DataProductListStubComponent
      ],
      providers: [
        { provide: UnpublishedProductsService, useValue: unpublishedProductsService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UnpublishedComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#get dataProducts()', () => {
    it('should return products array from unpublishedProductsService', () => {
      expect(component.dataProducts).toEqual(<any> [ 'DATA_PRODUCT' ]);
    });
  });
});
