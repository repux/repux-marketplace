import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DataProductListService } from '../services/data-product-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { map, pluck } from 'rxjs/operators';
import { Eula, Attachment } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';

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
    private dataProductListService: DataProductListService,
    private ipfsService: IpfsService) {
  }

  downloadEula(event: MouseEvent, eula: Eula): Promise<void> {
    event.stopPropagation();

    return this.ipfsService.downloadAndSave(eula.fileHash, eula.fileName);
  }

  downloadSampleFile(event: MouseEvent, file: Attachment): Promise<void> {
    event.stopPropagation();

    return this.ipfsService.downloadAndSave(file.fileHash, file.fileName);
  }

  ngOnInit(): void {
    this.activeRoute.params.subscribe(routeParams => {
      this.loadProduct(routeParams.address);
    });
  }

  loadProduct(address: string): void {
    this.product$ = this.dataProductListService.getDataProduct(address).pipe(
      pluck('hits'),
      map(obj => obj[ 0 ]),
      pluck('source')
    );
  }

  goBack(): void {
    if (<any>document.referrer !== '') {
      this.location.back();
    } else {
      this.router.navigateByUrl('/marketplace');
    }
  }
}
