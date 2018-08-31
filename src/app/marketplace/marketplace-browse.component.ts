import { Component, OnInit } from '@angular/core';
import { DataProductListService } from '../services/data-product-list.service';
import { deepCopy } from '../shared/utils/deep-copy';
import { DataProduct } from '../shared/models/data-product';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Eula } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { PageEvent } from '@angular/material';
import { RepuxWeb3Service } from '../services/repux-web3.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { EsResponse } from '../shared/models/es-response';
import { CategoryOption, SortingOption } from './marketplace-list-filter/marketplace-list-filter.component';
import { ProductCategoryService } from '../services/product-category.service';

export const SortingOptions: SortingOption[] = [
  {
    sortBy: 'creationTimestamp:desc',
    label: 'Date added - latest',
    isSelected: false
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
  selector: 'app-marketplace-browse',
  templateUrl: './marketplace-browse.component.html',
  styleUrls: [ './marketplace-browse.component.scss' ]
})
export class MarketplaceBrowseComponent implements OnInit {
  pageSizeOptions = environment.repux.pageSizeOptions;
  currencyPrecision = environment.repux.currency.shortPrecision;
  dataProducts: DataProduct[];
  sort = SortingOptions[ 0 ].sortBy;
  size: number;
  from = 0;
  query = [];
  categoryFilter = [];
  products$: Observable<EsResponse<DataProduct>>;
  availableActions = [ ActionButtonType.Buy, ActionButtonType.Rate ];
  filterIsOpened = false;
  filterValues: { sort: string, categories: string[], search: string } = { sort: '', categories: [], search: '' };
  categoriesList: CategoryOption[];
  sortingOptionsList: SortingOption[];

  private inputChangeSubject = new BehaviorSubject<string>(undefined);
  private categoryChangeSubject = new BehaviorSubject<string[]>(undefined);
  private staticQuery = {
    bool: {
      must: [],
      must_not: [
        { match: { disabled: true } }
      ]
    }
  };

  constructor(
    private dataProductListService: DataProductListService,
    private ipfsService: IpfsService,
    private repuxWeb3Service: RepuxWeb3Service,
    private productCategoryService: ProductCategoryService
  ) {
    this.size = this.pageSizeOptions[ 0 ];
  }

  async ngOnInit() {
    this.sortingOptionsList = SortingOptions.map(obj => ({ ...obj }));

    const categories = await this.productCategoryService.getFlattenCategories();
    this.categoriesList = [];
    categories.forEach(category => this.categoriesList.push({
      label: category,
      isSelected: false
    }));

    const filterNeedsToBeApplied = this.readQueryParams();
    if (!filterNeedsToBeApplied) {
      this.refreshData();
    }

    this.inputChangeSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(value => typeof value !== 'undefined')
      )
      .subscribe(() => this.applyFilter());

    this.categoryChangeSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(value => typeof value !== 'undefined')
      )
      .subscribe(() => this.applyFilter());
  }

  onCategoryChange(selection: string[]) {
    const categorySelectionIndexes = [];

    this.categoriesList
      .forEach((category, index) => {
        if (selection.indexOf(category.label) > -1) {
          categorySelectionIndexes.push(index);
        }
      });
    this.addQueryParam('category', categorySelectionIndexes.join(','));
    this.categoryChangeSubject.next(selection);
  }

  onSortingOptionChange(value: string) {
    this.addQueryParam('sort', value);
    this.sort = value;
    this.applyFilter();
  }

  onTypeAhead(value: string) {
    this.addQueryParam('search', value);
    this.inputChangeSubject.next(value);
  }

  applyFilter(): void {
    const search = (this.inputChangeSubject.getValue() || '').trim().toLowerCase();
    this.filterValues.search = search;

    this.query = [
      { regexp: { name: '.*"' + search + '".*' } },
      { regexp: { title: '.*"' + search + '".*' } },
      { regexp: { category: '.*"' + search + '".*' } },
      { fuzzy: { name: search } },
      { fuzzy: { title: search } },
      { fuzzy: { category: search } }
    ];

    this.categoryFilter = (this.categoryChangeSubject.getValue() || []).map(category => {
      return { match: { category } };
    });

    this.from = 0;
    this.refreshData();
  }

  downloadEula(eula: Eula): Promise<void> {
    return this.ipfsService.downloadAndSave(eula.fileHash, eula.fileName);
  }

  pageChanged(pageChangeEvent: PageEvent): void {
    this.size = pageChangeEvent.pageSize;
    this.from = pageChangeEvent.pageIndex * this.size;

    this.refreshData();
  }

  async refreshData(): Promise<void> {
    const query = deepCopy(this.staticQuery);
    query.bool.must.push({ bool: { should: this.query } });

    if (this.categoryFilter.length) {
      query.bool.must.push({ bool: { should: this.categoryFilter } });
    }

    let productsRaw$ = this.dataProductListService.getDataProducts(query, this.sort, this.size, this.from);
    const repuxWeb3Service = await this.repuxWeb3Service;

    if (await repuxWeb3Service.isWalletAvailable()) {
      productsRaw$ = this.dataProductListService.getBlockchainStateForDataProducts(productsRaw$);
    }

    this.products$ = productsRaw$;
  }

  toggleFilter() {
    this.filterIsOpened = !this.filterIsOpened;
  }

  addQueryParam(name: string, value: string) {
    const url = new URL(window.location.toString());
    const params = new URLSearchParams(url.search.slice(1));

    if (params.has(name)) {
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
    } else {
      params.append(name, value);
    }

    window.history.replaceState({}, '', window.location.pathname + '?' + params);
  }

  readQueryParams(): boolean {
    let filterNeedsToBeApplied = false;
    const url = new URL(window.location.toString());
    const params = new URLSearchParams(url.search.slice(1));

    if (params.has('search')) {
      filterNeedsToBeApplied = true;
      this.inputChangeSubject.next(params.get('search'));
    }

    if (params.has('sort')) {
      this.sort = params.get('sort');
      this.sortingOptionsList.find(option => option.sortBy === this.sort).isSelected = true;
    } else {
      this.sortingOptionsList[ 0 ].isSelected = true;
    }

    if (params.has('category')) {
      filterNeedsToBeApplied = true;
      const categoriesFromParams = [];

      params.get('category')
        .split(',')
        .forEach(categoryIndex => {
          if (this.categoriesList[categoryIndex]) {
            const category = this.categoriesList[categoryIndex];
            category.isSelected = true;
            categoriesFromParams.push(category.label);
          }
        });
      this.categoryChangeSubject.next(categoriesFromParams);
    }

    return filterNeedsToBeApplied;
  }
}


