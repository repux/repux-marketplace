import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DataProductListService } from '../services/data-product-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { Eula, Attachment } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { DataProduct } from '../shared/models/data-product';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/models/user';

@Component({
  selector: 'app-product-details',
  templateUrl: './marketplace-product-details.component.html',
  styleUrls: [ './marketplace-product-details.component.scss' ]
})
export class MarketplaceProductDetailsComponent implements OnInit, OnDestroy {
  product$: Observable<DataProduct>;
  owner$: Observable<User>;

  private productSubscription: Subscription;

  constructor(
    private router: Router,
    private location: Location,
    private activeRoute: ActivatedRoute,
    private dataProductListService: DataProductListService,
    private userService: UserService,
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

  ngOnDestroy(): void {
    this.usnsubscribeFromProductSubscription();
  }

  loadOwner(address: string): void {
    this.owner$ = this.userService.getUser(address);
  }

  loadProduct(address: string): void {
    this.product$ = this.dataProductListService.getDataProduct(address);

    this.usnsubscribeFromProductSubscription();
    this.productSubscription = this.product$.subscribe((product: DataProduct) => this.loadOwner(product.ownerAddress));
  }

  usnsubscribeFromProductSubscription() {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
  }
}
