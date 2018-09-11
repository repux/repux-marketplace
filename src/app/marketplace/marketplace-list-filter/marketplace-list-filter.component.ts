import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { foldingAnimation } from '../../shared/animations/folding.animation';

export interface SortingOption {
  sortBy: string;
  label: string;
  isSelected: boolean;
}

export interface CategoryOption {
  label: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-marketplace-list-filter',
  templateUrl: './marketplace-list-filter.component.html',
  styleUrls: [ './marketplace-list-filter.component.scss' ],
  animations: [ foldingAnimation('visibilityChanged') ]
})
export class MarketplaceListFilterComponent implements OnChanges {
  @Input() isOpened: boolean;
  @Input() categoryOptions: CategoryOption[];
  @Input() sortingOptions: SortingOption[];
  @Output() isOpenedChange = new EventEmitter<boolean>();
  @Output() categoryChange = new EventEmitter<string[]>();
  @Output() sortingOptionChange = new EventEmitter<string>();

  categoriesSelectedAll = true;

  constructor() {
  }

  ngOnChanges(changes) {
    if (changes.categoryOptions &&
      changes.categoryOptions.currentValue &&
      changes.categoryOptions.currentValue.find(category => category.isSelected)
    ) {
      this.categoriesSelectedAll = false;
    }
  }

  toggleAllCategories() {
    this.categoryOptions.forEach(category => category.isSelected = false);
    this.categoriesSelectedAll = true;
    this.categoryChange.emit([]);
  }

  toggleCategory(choice: CategoryOption) {
    choice.isSelected = !choice.isSelected;

    const selection = this.categoryOptions
      .filter(category => category.isSelected)
      .map(category => category.label);

    this.categoriesSelectedAll = !selection.length;
    this.categoryChange.emit(selection);
  }

  chooseSortingOption(choice: SortingOption) {
    this.sortingOptions.forEach(option => option.isSelected = false);
    choice.isSelected = !choice.isSelected;
    this.sortingOptionChange.emit(choice.sortBy);
  }

  close() {
    this.isOpenedChange.emit(false);
  }
}
