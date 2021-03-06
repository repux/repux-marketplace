import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataProductListService } from '../../services/data-product-list.service';
import { EsResponse } from '../../shared/models/es-response';
import { MatPaginator, MatTableDataSource, PageEvent, Sort } from '@angular/material';
import { environment } from '../../../environments/environment';
import { DataProductOrder } from '../../shared/models/data-product-order';
import { BigNumber } from 'bignumber.js';
import { DataProduct } from '../../shared/models/data-product';
import { deepCopy } from '../../shared/utils/deep-copy';
import { Subscription } from 'rxjs/internal/Subscription';
import { PendingFinalisationService } from '../services/pending-finalisation.service';
import { Eula, EulaType } from '@repux/repux-lib';
import { IpfsService } from '../../services/ipfs.service';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { urlSearchParamsToJSON } from '../../shared/utils/url';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-data-product-list',
  templateUrl: './marketplace-data-product-list.component.html',
  styleUrls: [ './marketplace-data-product-list.component.scss' ]
})
export class MarketplaceDataProductListComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() staticQuery = { bool: {} };
  @Input() displayedColumns = [
    'title',
    'price',
    'eula',
    'actions'
  ];
  @Input() availableActions = [
    ActionButtonType.Buy,
    ActionButtonType.Rate
  ];
  @Input() disablePendingFinalisation = false;
  @Input() displayPendingOrders = false;
  @Input() showPaginator = true;
  @Input() showSearch = true;
  @Input() showFilters = true;
  @Input() disableSorting = false;
  @Input() buyerAddress: string;
  @Input() dataProducts: DataProduct[];
  @Input() defaultSort = {};
  @Input() nestedSortFilters = {};

  sortActive: string;
  sortDirection: string;
  eulaType = EulaType;
  esDataProducts: EsResponse<DataProduct>;
  dataSource: MatTableDataSource<DataProduct>;
  pageSizeOptions = environment.repux.pageSizeOptions;
  isLoadingResults = true;
  query = [];
  sort: Object = {};
  size: number;
  from: number;
  textColumns: string[] = [
    'name',
    'title',
    'shortDescription',
    'fullDescription'
  ];
  currencyColumns: string[] = [
    'price',
    'buyersDeposit',
    'funds',
    'fundsToWithdraw'
  ];

  private _dataProductsSubscription: Subscription;
  private inputChangeSubject = new BehaviorSubject<string>(undefined);

  filterValues: { search: string } = { search: '' };
  queryParams: Object;

  constructor(
    public dataProductListService: DataProductListService,
    private _pendingFinalisationService: PendingFinalisationService,
    private ipfsService: IpfsService) {
    this.size = this.pageSizeOptions[ 0 ];
  }

  ngOnInit() {
    this.inputChangeSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(value => typeof value !== 'undefined')
      )
      .subscribe(() => this.applyFilter());

    this.readQueryParams();
  }

  ngOnChanges() {
    this.reloadRecords();
    return this.refreshData();
  }

  onTypeAhead(value: string) {
    this.addQueryParam('search', value);
    this.inputChangeSubject.next(value);
  }

  applyFilter(): Promise<void> {
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

    this.from = 0;
    return this.refreshData();
  }

  pageChanged(pageChangeEvent: PageEvent): Promise<void> {
    this.size = pageChangeEvent.pageSize;
    this.from = pageChangeEvent.pageIndex * this.size;
    return this.refreshData();
  }

  sortChanged(sort: Sort): Promise<void> {
    if (!sort.active || sort.direction === '') {
      this.sort = {};
      this.refreshData();

      return;
    }

    this.sort = { [ this.getColumn(sort.active) ]: { order: sort.direction } };
    return this.refreshData();
  }

  refreshData(): Promise<void> {
    if (this.dataProducts) {
      this.reloadRecords();
      return;
    }

    this.prepareSortingParameters();

    const query = deepCopy(this.staticQuery);
    if (!query.bool) {
      query.bool = {};
    }
    if (!query.bool.must) {
      query.bool.must = [];
    }
    query.bool.must.push({ bool: { should: this.query } });

    return new Promise(resolve => {
      this.isLoadingResults = true;
      this._unsubscribeDataProducts();
      this._dataProductsSubscription = this.dataProductListService
        .getDataProducts(query, this.sort, this.size, this.from)
        .subscribe(esDataProducts => {
          this.esDataProducts = esDataProducts;
          this.reloadRecords();
          resolve();
        });
    });
  }

  getTimesPurchased(dataProduct: DataProduct): number {
    return dataProduct.orders.filter(order => order.finalised).length;
  }

  getTotalEarnings(dataProduct: DataProduct): BigNumber {
    return dataProduct.orders.filter(order => order.finalised)
      .reduce((acc, order) => acc = acc.plus(order.price), new BigNumber(0));
  }

  getOrdersToFinalisation(dataProduct: DataProduct): DataProductOrder[] {
    return dataProduct.orders.filter(order => {
      return !order.finalised && this._pendingFinalisationService.findOrder(dataProduct.address, order.buyerAddress);
    });
  }

  getOrderDate(dataProduct: DataProduct) {
    const order = this._findOrderByCurrentBuyerAddress(dataProduct);

    if (!order) {
      return;
    }

    return new Date((order.deliveryDeadline.getTime() - dataProduct.daysToDeliver * DAY_IN_MILLISECONDS));
  }

  ngOnDestroy() {
    this._unsubscribeDataProducts();
  }

  reloadRecords() {
    if (this.dataProducts) {
      this.dataSource = new MatTableDataSource(this.dataProducts);
    } else if (this.esDataProducts) {
      this.dataSource = new MatTableDataSource(this.esDataProducts.hits);
    }

    this.isLoadingResults = false;
  }

  downloadEula(event: MouseEvent, eula: Eula): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    return this.ipfsService.downloadAndSave(eula.fileHash, eula.fileName);
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

    this.queryParams = urlSearchParamsToJSON(params);
    window.history.replaceState({}, '', window.location.pathname + '?' + params);
  }

  readQueryParams() {
    const url = new URL(window.location.toString());
    const params = new URLSearchParams(url.search.slice(1));

    if (params.has('search')) {
      this.inputChangeSubject.next(params.get('search'));
    }

    this.queryParams = urlSearchParamsToJSON(params);
  }

  private _findOrderByCurrentBuyerAddress(dataProduct: DataProduct) {
    if (!this.buyerAddress) {
      return;
    }

    return dataProduct.orders.find(orders => orders.buyerAddress === this.buyerAddress);
  }

  private getColumn(columnName) {
    if (this.textColumns.includes(columnName)) {
      return columnName + '.keyword';
    }

    if (this.currencyColumns.includes(columnName)) {
      return columnName + '.numeric';
    }

    return columnName;
  }

  private _unsubscribeDataProducts() {
    if (this._dataProductsSubscription) {
      this._dataProductsSubscription.unsubscribe();
      this._dataProductsSubscription = null;
    }
  }

  private prepareSortingParameters() {
    if (this.defaultSort) {
      const defaultSortKeys = Object.keys(this.defaultSort);

      if (JSON.stringify(this.sort) === '{}') {
        this.sort = this.defaultSort;

        if (defaultSortKeys.length) {
          this.sortActive = defaultSortKeys[ 0 ];
          this.sortDirection = this.defaultSort[ defaultSortKeys[ 0 ] ].order;
        }
      }
    }

    const activeSortKeys = Object.keys(this.sort);
    if (!activeSortKeys.length) {
      return;
    }

    const activeSortFilters = this.nestedSortFilters[ activeSortKeys[ 0 ] ];
    if (!activeSortFilters) {
      return;
    }

    Object.assign(this.sort[ activeSortKeys[ 0 ] ], activeSortFilters);
  }
}
