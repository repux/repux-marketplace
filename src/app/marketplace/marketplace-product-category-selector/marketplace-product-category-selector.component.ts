import { Component, Input, OnInit } from '@angular/core';
import { ProductCategoryService } from '../../services/product-category.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-marketplace-product-category-selector',
  templateUrl: './marketplace-product-category-selector.component.html',
  styleUrls: [ './marketplace-product-category-selector.component.scss' ]
})
export class MarketplaceProductCategorySelectorComponent implements OnInit {
  @Input() required: boolean;
  @Input() formControl: FormControl;
  @Input() value: string[];
  @Input() placeholder = 'Categories';

  public flatCategories: string[];

  constructor(private _productCategoryService: ProductCategoryService) {
  }

  ngOnInit() {
    this.fetchCategories();
  }

  async fetchCategories() {
    this.flatCategories = await this._productCategoryService.getFlattenCategories();
  }
}