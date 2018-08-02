import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataProductListService } from '../services/data-product-list.service';
import { deepCopy } from '../shared/utils/deep-copy';
import { DataProduct } from '../shared/models/data-product';
import { debounceTime, distinctUntilChanged, pluck } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Eula } from 'repux-lib/src/repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-marketplace-browse',
  templateUrl: './marketplace-browse.component.html',
  styleUrls: [ './marketplace-browse.component.scss' ]
})
export class MarketplaceBrowseComponent implements OnInit, OnDestroy {
  private inputChangeSubject = new Subject<string>();
  private dataProductsSubscription: Subscription;
  private staticQuery = {
    bool: {
      must: [],
      must_not: [
        { match: { disabled: true } }
      ]
    }
  };
  public pageSizeOptions = environment.repux.pageSizeOptions;
  public currencyFormat: string = environment.repux.currency.format;
  public dataProducts: DataProduct[];
  public sort: string;
  public size: number;
  public from = 0;
  public query = [];

  constructor(
    private dataProductListService: DataProductListService,
    private ipfsService: IpfsService
  ) {
    this.size = this.pageSizeOptions[ 0 ];
  }

  ngOnInit() {
    this.refreshData();
    this.inputChangeSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => this.applyFilter(value));
  }

  ngOnDestroy() {
    if (this.dataProductsSubscription) {
      this.dataProductsSubscription.unsubscribe();
    }
  }

  onTypeAhead(value: string) {
    this.inputChangeSubject.next(value);
  }

  applyFilter(filterValue: string): void {
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

  refreshData(): void {
    const query = deepCopy(this.staticQuery);
    query.bool.must.push({ bool: { should: this.query } });

    if (this.dataProductsSubscription) {
      this.dataProductsSubscription.unsubscribe();
    }

    this.dataProductsSubscription = this.dataProductListService
      .getDataProductsWithBlockchainState(query, this.sort, this.size, this.from)
      .pipe(
        pluck('hits')
      )
      .subscribe(products => {
        this.dataProducts = products as DataProduct[];
      });
  }
}


