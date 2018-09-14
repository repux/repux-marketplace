import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataProductListService } from '../services/data-product-list.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { Attachment, Eula } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { DataProduct } from '../shared/models/data-product';
import { Subscription } from 'rxjs/internal/Subscription';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { DataProductService } from '../services/data-product.service';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';
import { DataProductOrder as BlockchainDataProductOrder } from 'repux-web3-api';
import { DataProductOrder } from '../shared/models/data-product-order';
import { ClockService } from '../services/clock.service';
import BigNumber from 'bignumber.js';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-product-details',
  templateUrl: './marketplace-product-details.component.html',
  styleUrls: [ './marketplace-product-details.component.scss' ]
})
export class MarketplaceProductDetailsComponent implements OnInit, OnDestroy {
  product$: Observable<DataProduct>;
  actionButtonType = ActionButtonType;
  availableActions = [ ActionButtonType.Buy, ActionButtonType.Rate ];
  wallet: Wallet;
  blockchainDataProductOrder: BlockchainDataProductOrder;
  daysToDeliverLeft: number;
  sellerRating = new BigNumber(0);
  finalisedOrders: DataProductOrder[] = [];
  etherscanUrl = environment.etherscanUrl;

  private subscriptions: Subscription[] = [];
  private dataProductAddress: string;

  constructor(
    private activeRoute: ActivatedRoute,
    private dataProductService: DataProductService,
    private dataProductListService: DataProductListService,
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

    this.daysToDeliverLeft = this.checkDaysToDeliverLeft(new Date());
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  loadProduct(address: string): void {
    this.product$ = this.dataProductListService.getDataProduct(address)
      .pipe(
        tap((product: DataProduct) => this.finalisedOrders = product.orders.filter(order => order.finalised))
      );

    if (this.wallet) {
      this.loadBlockchainDataProductOrder();
    }
  }

  async loadBlockchainDataProductOrder(): Promise<void> {
    this.blockchainDataProductOrder = await this.dataProductService.getOrderData(this.dataProductAddress, this.wallet.address);
    this.daysToDeliverLeft = this.checkDaysToDeliverLeft(new Date());
  }

  scrollToTop() {
    document.querySelector('.app-view').parentElement.scrollTop = 0;
  }

  scrollIntoView(id: string) {
    const element = document.querySelector(`#${id}`);
    if (element) {
      element.scrollIntoView();
    }
  }
}
