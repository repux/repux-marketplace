import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { DataProductListService } from '../services/data-product-list.service';
import { EsResponse } from '../es-response';
import { EsDataProduct } from '../es-data-product';
import { MatPaginator, MatTableDataSource, PageEvent, Sort } from '@angular/material';
import { environment } from '../../environments/environment';
import { Deserializable } from '../deserializable';
import { DataProductTransaction } from '../data-product-transaction';
import { BigNumber } from 'bignumber.js';
import { DataProduct } from '../data-product';
import { deepCopy } from '../utils/deep-copy';
import { DataProductNotificationsService } from '../services/data-product-notifications.service';

@Component({
  selector: 'app-data-product-list',
  templateUrl: './data-product-list.component.html',
  styleUrls: [ './data-product-list.component.scss' ]
})
export class DataProductListComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() staticQuery = { bool: {} };
  @Input() displayedColumns = [
    'name',
    'title',
    'category',
    'daysForDeliver',
    'size',
    'price',
    'actions'
  ];
  @Input() availableActions = [
    'buy'
  ];
  @Input() displayPendingTransactions = false;
  @Input() showPaginator = true;
  @Input() showSearch = true;
  @Input() showFilters = true;
  @Input() enableSorting = true;
  @Input() dataProducts: DataProduct[];

  public esDataProducts: EsResponse<Deserializable<EsDataProduct>>;
  public dataSource: MatTableDataSource<DataProduct>;
  public pageSizeOptions = environment.repux.pageSizeOptions;
  public isLoadingResults = true;
  public query = [];
  public sort: string;
  public size: number;
  public from: number;
  public currencyName = ` ${environment.repux.currency.defaultName} `;
  public currencyFormat: string = environment.repux.currency.format;
  public textColumns: string[] = [
    'name',
    'title',
    'category',
    'shortDescription',
    'fullDescription'
  ];

  constructor(
    public dataProductListService: DataProductListService,
    private _dataProductNotificationsService: DataProductNotificationsService) {
    this.size = this.pageSizeOptions[ 0 ];
  }

  ngOnInit(): Promise<void> {
    return this.refreshData();
  }

  ngOnChanges() {
    return this.refreshData();
  }

  private getColumn(columnName) {
    if (this.textColumns.includes(columnName)) {
      return columnName + '.keyword';
    }

    return columnName;
  }

  applyFilter(filterValue: string): Promise<void> {
    const search = filterValue.trim().toLowerCase();

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
      delete this.sort;
      this.refreshData();

      return;
    }

    this.sort = `${this.getColumn(sort.active)}:${sort.direction}`;
    return this.refreshData();
  }

  refreshData(): Promise<void> {
    if (this.dataProducts) {
      this.dataSource = new MatTableDataSource(this.dataProducts);
      this.isLoadingResults = false;
      return;
    }

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
      this.dataProductListService.getFiles(query, this.sort, this.size, this.from)
        .subscribe(esDataProducts => {
          this.esDataProducts = esDataProducts;
          const dataProducts = this.esDataProducts.hits.map((esDataProduct: EsDataProduct) => esDataProduct.source);
          this.dataSource = new MatTableDataSource(dataProducts);
          this.isLoadingResults = false;
          resolve();
        });
    });
  }

  getTimesPurchased(dataProduct: DataProduct): number {
    return dataProduct.transactions.filter(transaction => transaction.finalised).length;
  }

  getTotalEarnings(dataProduct: DataProduct): BigNumber {
    return dataProduct.transactions.filter(transaction => transaction.finalised)
      .reduce((acc, transaction) => acc = acc.plus(transaction.price), new BigNumber(0));
  }

  getTransactionsToFinalisation(dataProduct: DataProduct): DataProductTransaction[] {
    return dataProduct.transactions.filter(transaction =>
      !transaction.finalised &&
      this._dataProductNotificationsService.findFinalisationRequest({
        dataProductAddress: dataProduct.address,
        buyerAddress: transaction.buyerAddress
      })
    );
  }
}
