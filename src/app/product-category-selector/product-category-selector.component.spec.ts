import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCategorySelectorComponent } from './product-category-selector.component';
import { MatSelectModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ProductCategorySelectorComponent', () => {
  let component: ProductCategorySelectorComponent;
  let fixture: ComponentFixture<ProductCategorySelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductCategorySelectorComponent ],
      imports: [
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NoopAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductCategorySelectorComponent);
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
