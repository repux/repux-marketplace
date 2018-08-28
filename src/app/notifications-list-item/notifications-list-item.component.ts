import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Eula } from 'repux-lib';
import { IpfsService } from '../services/ipfs.service';
import { DataProduct } from '../shared/models/data-product';
import { DataProductOrder as BlockchainDataProductOrder } from 'repux-web3-api/src/data-product-order';
import { DataProductService } from '../services/data-product.service';
import { WalletService } from '../services/wallet.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications-list-item',
  templateUrl: './notifications-list-item.component.html',
  styleUrls: [ './notifications-list-item.component.scss' ]
})
export class NotificationsListItemComponent implements OnInit, OnDestroy {

  @Input() actions: string[];
  @Input() product: DataProduct;
  @Input() showOrders = true;
  @Input() showMyOrderData: false;
  expanded = false;
  myOrderData: BlockchainDataProductOrder;

  private subscription: Subscription;

  constructor(
    private ipfsService: IpfsService,
    private dataProductService: DataProductService,
    private walletService: WalletService
  ) {
  }

  ngOnInit() {
    if (this.showMyOrderData) {
      this.subscription = this.walletService.getWallet().subscribe(async wallet => {
        this.myOrderData = await this.dataProductService.getOrderData(this.product.address, wallet.address);
      });
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
