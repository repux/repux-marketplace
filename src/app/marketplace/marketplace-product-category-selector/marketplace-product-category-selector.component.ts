import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProductCategoryService } from '../../services/product-category.service';
import { FormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material';

@Component({
  selector: 'app-marketplace-product-category-selector',
  templateUrl: './marketplace-product-category-selector.component.html',
  styleUrls: [ './marketplace-product-category-selector.component.scss' ]
})
export class MarketplaceProductCategorySelectorComponent implements OnInit {
  @Input() required = false;
  @Input() formControl = new FormControl([]);
  @Input() value: string[] = [];
  @Input() placeholder = 'Categories';
  @Input() showAllCheckbox = false;
  @Input() noUnderline = false;
  @Input() noFloatPlaceholder = false;
  @Input() noPadding = false;
  @Output() valueChange = new EventEmitter<string[]>();

  public flatCategories: string[];

  constructor(private _productCategoryService: ProductCategoryService) {
  }

  get itemsNotSelected(): string[] {
    if (!this.flatCategories) {
      return [];
    }

    return this.flatCategories.filter(category => !this.formControl.value.includes(category));
  }

  async fetchCategories() {
    this.flatCategories = await this._productCategoryService.getFlattenCategories();
  }

  async ngOnInit() {
    await this.fetchCategories();
  }

  onValueChange() {
    this.valueChange.emit(this.value);
  }

  toggleAll(event: MatCheckboxChange) {
    if (event.checked) {
      const value = [];
      this.formControl.setValue(value);
      this.valueChange.emit(value);
    }
  }
}
