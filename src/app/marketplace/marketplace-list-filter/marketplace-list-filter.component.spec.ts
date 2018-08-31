import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceListFilterComponent } from './marketplace-list-filter.component';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
import { ProductCategoryService } from '../../services/product-category.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MarketplaceListFilterComponent', () => {
  let component: MarketplaceListFilterComponent;
  let fixture: ComponentFixture<MarketplaceListFilterComponent>;
  let projectCategoryServiceStub: ProductCategoryService;

  const categoriesList = [
    { label: 'category1', isSelected: false },
    { label: 'category2', isSelected: false },
    { label: 'category3', isSelected: false },
    { label: 'category4', isSelected: false },
    { label: 'category5', isSelected: false },
    { label: 'category6', isSelected: false }
  ];

  beforeEach(async(() => {
    projectCategoryServiceStub = jasmine.createSpyObj('projectCategoryServiceStub', {
      'getFlattenCategories': categoriesList.map(category => category.label)
    });


    TestBed.configureTestingModule({
      declarations: [ MarketplaceListFilterComponent ],
      imports: [
        SharedModule,
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ProductCategoryService, useValue: projectCategoryServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceListFilterComponent);
    component = fixture.componentInstance;
    spyOn(component.categoryChange, 'emit');
    spyOn(component.sortingOptionChange, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load flatten categories on initialize', async () => {
    await component.ngOnInit();
    expect(component.categories).toEqual(categoriesList);
  });

  describe('#toggleAll()', () => {
    it('should emit an event with empty selection', () => {
      component.toggleAllCategories();
      expect(component.categoryChange.emit).toHaveBeenCalledWith([]);
    });
  });

  describe('#toggleCategory()', () => {
    it('should emit an event with proper selection', async () => {
      await component.ngOnInit();

      const categories = component.categories;

      component.toggleCategory(categories[0]);
      expect(component.categoryChange.emit).toHaveBeenCalledWith(['category1']);
      component.toggleCategory(categories[5]);
      expect(component.categoryChange.emit).toHaveBeenCalledWith(['category1', 'category6']);
      component.toggleCategory(categories[5]);
      expect(component.categoryChange.emit).toHaveBeenCalledWith(['category1']);
      component.toggleCategory(categories[0]);
      expect(component.categoryChange.emit).toHaveBeenCalledWith([]);
    })
  });

  describe('#chooseSortingOption()', () => {
    it('should emit an event with single selection', () => {
      const options = component.sortingOptions;
      component.chooseSortingOption(options[0]);
      expect(component.sortingOptionChange.emit).toHaveBeenCalledWith(options[0].sortBy);
    })
  });
});
