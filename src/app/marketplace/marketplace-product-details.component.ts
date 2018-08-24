import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DataProductListService } from '../services/data-product-list.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { Attachment, Eula } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { DataProduct } from '../shared/models/data-product';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/models/user';
import { environment } from '../../environments/environment';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { DataProductService } from '../services/data-product.service';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';
import { DataProductOrder as BlockchainDataProductOrder } from 'repux-web3-api';
import { ClockService } from '../services/clock.service';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-product-details',
  templateUrl: './marketplace-product-details.component.html',
  styleUrls: [ './marketplace-product-details.component.scss' ]
})
export class MarketplaceProductDetailsComponent implements OnInit, OnDestroy {
  product$: Observable<DataProduct>;
  owner$: Observable<User>;
  actionButtonType = ActionButtonType;
  availableActions = [ ActionButtonType.Buy, ActionButtonType.Rate ];
  public currencyFormat: string = environment.repux.currency.format;
  public wallet: Wallet;
  public blockchainDataProductOrder: BlockchainDataProductOrder;
  public daysToDeliverLeft: number;

  private productSubscription: Subscription;
  private walletSubscription: Subscription;
  private clockSubscription: Subscription;
  private dataProductAddress: string;

  constructor(
    private router: Router,
    private location: Location,
    private activeRoute: ActivatedRoute,
    private dataProductService: DataProductService,
    private dataProductListService: DataProductListService,
    private userService: UserService,
    private ipfsService: IpfsService,
    private walletService: WalletService,
    private clockService: ClockService) {
  }

  get userIsBuyer(): boolean {
    return Boolean(this.blockchainDataProductOrder);
  }

  downloadEula(eula: Eula): Promise<void> {
    return this.ipfsService.downloadAndSave(eula.fileHash, eula.fileName);
  }

  downloadSampleFile(event: MouseEvent, file: Attachment): Promise<void> {
    event.stopPropagation();

    return this.ipfsService.downloadAndSave(file.fileHash, file.fileName);
  }

  checkDaysToDeliverLeft(date: Date): number {
    if (!this.blockchainDataProductOrder) {
      return 0;
    }

    return Math.ceil((this.blockchainDataProductOrder.deliveryDeadline.getTime() - date.getTime()) / DAY_IN_MILLISECONDS);
  }

  ngOnInit(): void {
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => {
      this.wallet = wallet;

      if (this.dataProductAddress) {
        this.loadBlockchainDataProductOrder();
      }
    });

    this.activeRoute.params.subscribe(routeParams => {
      this.dataProductAddress = routeParams.address;
      this.loadProduct(routeParams.address);
    });

    this.clockSubscription = this.clockService.onEachSecond().subscribe(date => {
      this.daysToDeliverLeft = this.checkDaysToDeliverLeft(date);
    });
  }

  ngOnDestroy(): void {
    this.usnsubscribeFromProductSubscription();

    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }

    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  loadOwner(address: string): void {
    this.owner$ = this.userService.getUser(address);
  }

  loadProduct(address: string): void {
    this.product$ = this.dataProductListService.getDataProduct(address);

    this.usnsubscribeFromProductSubscription();
    this.productSubscription = this.product$.subscribe(async (product: DataProduct) => {
      this.loadOwner(product.ownerAddress);
    });

    if (this.wallet) {
      this.loadBlockchainDataProductOrder();
    }
  }

  async loadBlockchainDataProductOrder() {
    this.blockchainDataProductOrder = await this.dataProductService.getOrderData(this.dataProductAddress, this.wallet.address);
  }

  scrollToTop() {
    document.querySelector('.app-view').parentElement.scrollTop = 0;
  }

  usnsubscribeFromProductSubscription() {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
  }
}
