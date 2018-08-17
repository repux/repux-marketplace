import { Component, OnInit } from '@angular/core';
import { DataProductListService } from '../services/data-product-list.service';
import { deepCopy } from '../shared/utils/deep-copy';
import { DataProduct } from '../shared/models/data-product';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Eula } from 'repux-lib/src/repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { PageEvent } from '@angular/material';
import { RepuxWeb3Service } from '../services/repux-web3.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { EsResponse } from '../shared/models/es-response';

@Component({
  selector: 'app-marketplace-browse',
  templateUrl: './marketplace-browse.component.html',
  styleUrls: [ './marketplace-browse.component.scss' ]
})
export class MarketplaceBrowseComponent implements OnInit {
  public pageSizeOptions = environment.repux.pageSizeOptions;
  public currencyFormat: string = environment.repux.currency.format;
  public dataProducts: DataProduct[];
  public sort: string;
  public size: number;
  public from = 0;
  public query = [];
  public categoryFilter = [];
  public products$: Observable<EsResponse<DataProduct>>;
  public availableActions = [ ActionButtonType.Buy, ActionButtonType.Rate ];

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
    private repuxWeb3Service: RepuxWeb3Service
  ) {
    this.size = this.pageSizeOptions[ 0 ];
  }

  ngOnInit() {
    this.refreshData();
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

  onCategoryChange(value: string[]) {
    this.categoryChangeSubject.next(value);
  }

  onTypeAhead(value: string) {
    this.inputChangeSubject.next(value);
  }

  applyFilter(): void {
    const search = (this.inputChangeSubject.getValue() || '').trim().toLowerCase();

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
      query.bool.must.push({ bool: { must: this.categoryFilter } });
    }

    let productsRaw$ = this.dataProductListService.getDataProducts(query, this.sort, this.size, this.from);
    const repuxWeb3Service = await this.repuxWeb3Service;

    if (await repuxWeb3Service.isWalletAvailable()) {
      productsRaw$ = this.dataProductListService.getBlockchainStateForDataProducts(productsRaw$);
    }

    this.products$ = productsRaw$;
  }
}


