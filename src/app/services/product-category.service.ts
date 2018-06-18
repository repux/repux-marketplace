import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService {
  private categories: Object;

  constructor(private http: HttpClient) {
  }

  async getCategories(): Promise<Object> {
    if (this.categories) {
      return this.categories;
    }

    this.categories = await this.http.get(environment.repux.categoriesListPath).toPromise();
    return this.categories;
  }

  async getFlattenCategories(): Promise<string[]> {
    const categories = await this.getCategories();
    return this.flattenCategories(categories);
  }

  private flattenCategories(subcategories: any): string[] {
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
