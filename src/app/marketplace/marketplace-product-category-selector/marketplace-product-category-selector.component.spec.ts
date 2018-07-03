import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceProductCategorySelectorComponent } from './marketplace-product-category-selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';

describe('MarketplaceProductCategorySelectorComponent', () => {
  let component: MarketplaceProductCategorySelectorComponent;
  let fixture: ComponentFixture<MarketplaceProductCategorySelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceProductCategorySelectorComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NoopAnimationsModule,
        MaterialModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceProductCategorySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#ngOnInit()', () => {
    it('should call getCategories method', () => {
      component.fetchCategories = jasmine.createSpy();
      component.ngOnInit();
      expect((<any> component.fetchCategories).calls.count()).toBe(1);
    });
  });

  describe('#getCategories', () => {
    it('should getFlattenCategories on productCategoryService', async () => {
      const categories = [ 'CATEGORY_1', 'CATEGORY_2' ];
      const getFlattenCategories = jasmine.createSpy();
      getFlattenCategories.and.returnValue(Promise.resolve(categories));
      component[ '_productCategoryService' ].getFlattenCategories = getFlattenCategories;

      await component.fetchCategories();
      expect(component.flatCategories).toEqual(categories);
      expect(getFlattenCategories.calls.count()).toBe(1);
    });
  });
});
