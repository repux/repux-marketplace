import { Component, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
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
import { Eula, EulaType } from 'repux-lib';
import { IpfsService } from '../../services/ipfs.service';
import { ActionButtonType } from '../../shared/enums/action-button-type';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-data-product-list',
  templateUrl: './marketplace-data-product-list.component.html',
  styleUrls: [ './marketplace-data-product-list.component.scss' ]
})
export class MarketplaceDataProductListComponent implements OnChanges, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() staticQuery = { bool: {} };
  @Input() displayedColumns = [
    'name',
    'title',
    'category',
    'size',
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

  public eulaType = EulaType;
  public esDataProducts: EsResponse<DataProduct>;
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

  private _dataProductsSubscription: Subscription;

  constructor(
    public dataProductListService: DataProductListService,
    private _pendingFinalisationService: PendingFinalisationService,
    private ipfsService: IpfsService) {
    this.size = this.pageSizeOptions[ 0 ];
  }

  ngOnChanges() {
    this.reloadRecords();
    return this.refreshData();
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
      this.reloadRecords();
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
      this._unsubscribeDataProducts();
      this._dataProductsSubscription = this.dataProductListService
        .getDataProductsWithBlockchainState(query, this.sort, this.size, this.from)
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

  getDeliveryDeadline(dataProduct: DataProduct) {
    const order = this._findOrderByCurrentBuyerAddress(dataProduct);

    if (!order) {
      return;
    }

    return order.deliveryDeadline;
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
    event.stopPropagation();

    return this.ipfsService.downloadAndSave(eula.fileHash, eula.fileName);
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

    return columnName;
  }

  private _unsubscribeDataProducts() {
    if (this._dataProductsSubscription) {
      this._dataProductsSubscription.unsubscribe();
      this._dataProductsSubscription = null;
    }
  }
}
