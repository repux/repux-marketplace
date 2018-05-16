import { Component, OnInit, ViewChild } from '@angular/core';
import { DataProductListService } from './data-product-list.service';
import { EsResponse } from '../es-response';
import { EsDataProduct } from '../es-data-product';
import { MatPaginator, MatTableDataSource, PageEvent, Sort } from '@angular/material';
import { environment } from '../../environments/environment';
import { Deserializable } from '../deserializable';

@Component({
  selector: 'app-data-product-list',
  templateUrl: './data-product-list.component.html',
  styleUrls: ['./data-product-list.component.scss']
})
export class DataProductListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public esDataProducts: EsResponse<Deserializable<EsDataProduct>>;
  public dataSource: MatTableDataSource<Deserializable<EsDataProduct>>;
  public displayedColumns = ['name', 'title', 'category', 'size', 'price'];
  public pageSizeOptions = environment.repux.pageSizeOptions;
  public isLoadingResults = true;
  public query: string;
  public sort: string;
  public size: number;
  public from: number;

  constructor(public dataProductListService: DataProductListService) {
    this.size = this.pageSizeOptions[0];
  }

  ngOnInit(): Promise<void> {
    return this.refreshData();
  }

  applyFilter(filterValue: string): Promise<void> {
    const search = '*' + filterValue.trim().toLowerCase() + '*';
    this.query = `name:${search} OR title:${search} OR category:${search}`;
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

    this.sort = `${sort.active}:${sort.direction}`;
    return this.refreshData();
  }

  refreshData(): Promise<void> {
    return new Promise(resolve => {
      this.isLoadingResults = true;
      this.dataProductListService.getFiles(this.query, this.sort, this.size, this.from)
        .subscribe(esDataProducts => {
          this.esDataProducts = esDataProducts;
          this.dataSource = new MatTableDataSource(this.esDataProducts.hits);
          this.isLoadingResults = false;
          resolve();
        });
    });
  }
}
