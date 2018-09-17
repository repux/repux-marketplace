import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Eula } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { DataProduct } from '../shared/models/data-product';
import { DataProductOrder as BlockchainDataProductOrder } from 'repux-web3-api/src/data-product-order';
import { DataProductService } from '../services/data-product.service';
import { WalletService } from '../services/wallet.service';
import { Subscription } from 'rxjs';
import { DataProduct as BlockchainDataProduct } from 'repux-web3-api';
import { environment } from '../../environments/environment';
import { ActionButtonType } from '../shared/enums/action-button-type';

@Component({
  selector: 'app-notifications-list-item',
  templateUrl: './notifications-list-item.component.html',
  styleUrls: [ './notifications-list-item.component.scss' ]
})
export class NotificationsListItemComponent implements OnInit, OnDestroy {

  @Input() actions: ActionButtonType[] = [];
  @Input() product: DataProduct;
  @Input() showOrders = true;
  @Input() showMyOrderData = false;
  expanded = false;
  myOrderData: BlockchainDataProductOrder;
  blockchainDataProduct: BlockchainDataProduct;
  currencyName = environment.repux.currency.defaultName;

  private subscription: Subscription;

  constructor(
    private ipfsService: IpfsService,
    private dataProductService: DataProductService,
    private walletService: WalletService
  ) {
  }

  get displayRemovedListingMessage() {
    return this.actions.includes(ActionButtonType.CancelPurchase) &&
      this.myOrderData && !this.myOrderData.finalised &&
      this.blockchainDataProduct && this.blockchainDataProduct.disabled;
  }

  async ngOnInit() {
    if (this.showMyOrderData) {
      this.subscription = this.walletService.getWallet().subscribe(async wallet => {
        this.myOrderData = await this.dataProductService.getOrderData(this.product.address, wallet.address);
      });
    }

    if (this.showMyOrderData || this.showOrders) {
      this.blockchainDataProduct = await this.dataProductService.getDataProductData(this.product.address);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  downloadEula(eula: Eula): Promise<void> {
    return this.ipfsService.downloadAndSave(eula.fileHash, eula.fileName);
  }

  toggle() {
    this.expanded = !this.expanded;
  }
}
