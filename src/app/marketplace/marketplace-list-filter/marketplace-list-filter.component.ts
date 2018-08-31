import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProductCategoryService } from '../../services/product-category.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

type Option = {
  sortBy?: string,
  label: string,
  isSelected: boolean
}

export const SortingOptions: Option[] = [
  {
    sortBy: 'creationTimestamp:desc',
    label: 'Date added - latest',
    isSelected: true
  },
  {
    sortBy: 'creationTimestamp:asc',
    label: 'Date added - oldest',
    isSelected: false
  },
  {
    sortBy: 'price.numeric:desc',
    label: 'Price - highest',
    isSelected: false
  },
  {
    sortBy: 'price.numeric:asc',
    label: 'Price - lowest',
    isSelected: false
  }
];

@Component({
  selector: 'app-marketplace-list-filter',
  templateUrl: './marketplace-list-filter.component.html',
  styleUrls: [ './marketplace-list-filter.component.scss' ],
  animations: [
    trigger('visibilityChanged', [
      state('true' , style({
        overflow: 'hidden',
        height: '*'
      })),
      state('false', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0'
      })),
      transition('1 => 0', animate('300ms ease-in-out')),
      transition('0 => 1', animate('300ms ease-in-out'))
    ])
  ]
})
export class MarketplaceListFilterComponent implements OnInit {
  @Input() isOpened: boolean;
  @Output() isOpenedChange = new EventEmitter<boolean>();
  @Output() categoryChange = new EventEmitter<string[]>();
  @Output() sortingOptionChange = new EventEmitter<string>();

  categories: Option[] = [];
  categoriesSelectedAll = true;

  sortingOptions: Option[] = SortingOptions;

  constructor(private productCategoryService: ProductCategoryService) {
  }

  async ngOnInit() {
    const categories = await this.productCategoryService.getFlattenCategories();
    this.categories = [];
    categories.forEach(category => this.categories.push({
      label: category,
      isSelected: false
    }));
  }

  toggleAllCategories() {
    this.categories.forEach(category => category.isSelected = false);
    this.categoriesSelectedAll = true;
    this.categoryChange.emit([])
  }

  toggleCategory(choice: Option) {
    choice.isSelected = !choice.isSelected;

    const selection = this.categories
      .filter(category => category.isSelected)
      .map(category => category.label);

    this.categoriesSelectedAll = !selection.length;
    this.categoryChange.emit(selection);
  }

  chooseSortingOption(choice: Option) {
    this.sortingOptions.forEach(option => option.isSelected = false);
    choice.isSelected = !choice.isSelected;
    this.sortingOptionChange.emit(choice.sortBy);
  }

  close() {
    this.isOpenedChange.emit(false);
  }
}
