import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataProductListService } from '../services/data-product-list.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { Attachment, Eula } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { DataProduct } from '../shared/models/data-product';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/models/user';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { DataProductService } from '../services/data-product.service';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';
import { DataProductOrder as BlockchainDataProductOrder } from 'repux-web3-api';
import { ClockService } from '../services/clock.service';
import BigNumber from 'bignumber.js';

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
  wallet: Wallet;
  blockchainDataProductOrder: BlockchainDataProductOrder;
  daysToDeliverLeft: number;
  sellerRating = new BigNumber(0);

  private subscriptions: Subscription[] = [];
  private dataProductAddress: string;

  constructor(
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
    this.subscriptions.push(
      this.walletService.getWallet().subscribe(wallet => {
        this.wallet = wallet;

        if (this.dataProductAddress) {
          this.loadBlockchainDataProductOrder();
        }
      })
    );

    this.activeRoute.params.subscribe(routeParams => {
      this.dataProductAddress = routeParams.address;
      this.loadProduct(routeParams.address);
    });

    this.subscriptions.push(
      this.clockService.onEachHour().subscribe(date => {
        this.daysToDeliverLeft = this.checkDaysToDeliverLeft(date);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  loadOwner(address: string): void {
    this.subscriptions.push(
      this.userService.getUser(address).subscribe(owner => this.sellerRating = owner.sellerRating)
    );
  }

  loadProduct(address: string): void {
    this.product$ = this.dataProductListService.getDataProduct(address);

    this.subscriptions.push(
      this.product$.subscribe(async (product: DataProduct) => {
        this.loadOwner(product.ownerAddress);
      })
    );

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

  scrollIntoView(id: string) {
    const element = document.querySelector(`#${id}`);
    if (element){
      element.scrollIntoView();
    }
  }
}
