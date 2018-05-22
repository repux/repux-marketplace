import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of } from 'rxjs/index'

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {
  private categories: Object;

  constructor(private http: HttpClient) {
  }

  getCategories(): Observable<Object> {
    if (this.categories) {
      return of(this.categories);
    }

    return this.http.get(`./assets/data-product-categories.json`);
  };

  getFlattenCategories(): Observable<string[]> {
    return from(new Promise(resolve => {
      const categories = this.getCategories();
      categories.subscribe(response => {
        resolve(this.flattenCategories(response));
      });
    }));
  }

  private flattenCategories(subcategories: any): any {
    const result = [];

    subcategories.forEach(subcategory => {
      result.push(subcategory.name);
      if (subcategory.subcategories && subcategory.subcategories.length) {
        result.push(...this.flattenCategories(subcategory.subcategories).map(sub => subcategory.name + ' > ' + sub));
      }
    });

    return result;
  }
}
