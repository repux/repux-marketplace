import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DataProductListService } from '../services/data-product-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { map, pluck } from 'rxjs/operators';

@Component({
  selector: 'app-product-details',
  templateUrl: './marketplace-product-details.component.html',
  styleUrls: [ './marketplace-product-details.component.scss' ]
})
export class MarketplaceProductDetailsComponent implements OnInit {
  product$: Observable<any>;

  constructor(
    private router: Router,
    private location: Location,
    private activeRoute: ActivatedRoute,
    private dataProductListService: DataProductListService) {
  }

  ngOnInit() {
    this.activeRoute.params.subscribe(routeParams => {
      this.loadProduct(routeParams.address);
    });
  }

  loadProduct(address: string) {
    this.product$ = this.dataProductListService.getDataProduct(address).pipe(
      pluck('hits'),
      map(obj => obj[ 0 ]),
      pluck('source')
    );
  }

  goBack() {
    if (<any>document.referrer !== '') {
      this.location.back();
    } else {
      this.router.navigateByUrl('/marketplace');
    }
  }
}
