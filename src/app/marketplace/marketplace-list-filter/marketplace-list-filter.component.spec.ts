import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryOption, MarketplaceListFilterComponent, SortingOption } from './marketplace-list-filter.component';
import { MaterialModule } from '../../material.module';
import { SharedModule } from '../../shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MarketplaceListFilterComponent', () => {
  let component: MarketplaceListFilterComponent;
  let fixture: ComponentFixture<MarketplaceListFilterComponent>;

  const categoriesList: CategoryOption[] = [
    { label: 'category1', isSelected: false },
    { label: 'category2', isSelected: false },
    { label: 'category3', isSelected: false },
    { label: 'category4', isSelected: false },
    { label: 'category5', isSelected: false },
    { label: 'category6', isSelected: false }
  ];

  const sortingList: SortingOption[] = [
    { label: 'sort by A', sortBy: 'a:asc', isSelected: false },
    { label: 'sort by B', sortBy: 'b:desc', isSelected: false }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceListFilterComponent ],
      imports: [
        SharedModule,
        MaterialModule,
        NoopAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceListFilterComponent);
    component = fixture.componentInstance;
    component.categoryOptions = categoriesList;
    component.sortingOptions = sortingList;

    spyOn(component.categoryChange, 'emit');
    spyOn(component.sortingOptionChange, 'emit');
    spyOn(component.isOpenedChange, 'emit');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#toggleAll()', () => {
    it('should emit an event with empty selection', () => {
      component.toggleAllCategories();
      expect(component.categoryChange.emit).toHaveBeenCalledWith([]);
    });
  });

  describe('#toggleCategory()', () => {
    it('should emit an event with proper selection', async () => {

      const categories = component.categoryOptions;

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

  describe('#close()', () => {
    it('should emit an event', () => {
      component.close();
      expect(component.isOpenedChange.emit).toHaveBeenCalledWith(false);
    })
  });
});
