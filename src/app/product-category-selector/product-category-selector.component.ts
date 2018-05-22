import { Component, Input, OnInit } from '@angular/core';
import { ProductCategoryService } from "../product-category.service";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'app-product-category-selector',
  templateUrl: './product-category-selector.component.html',
  styleUrls: ['./product-category-selector.component.scss']
})
export class ProductCategorySelectorComponent implements OnInit {
  @Input() required: boolean;
  @Input() formControl: FormControl;
  @Input() value: string[];
  @Input() placeholder: string = 'Categories';

  public flatCategories: string[];

  constructor(public productCategoryService: ProductCategoryService) { }

  ngOnInit() {
    this.getCategories();
  }

  getCategories() {
    this.productCategoryService.getFlattenCategories()
      .subscribe( result => {
        this.flatCategories = result;
      })
  }
}
