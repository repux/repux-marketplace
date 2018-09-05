import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { DataProduct as BlockchainDataProduct, DataProductOrder as BlockchainDataProductOrder } from 'repux-web3-api';
import { DataProductService } from '../../services/data-product.service';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { Subscription } from 'rxjs';
import { BigNumber } from 'bignumber.js';
import { ActionButtonType } from '../../shared/enums/action-button-type';

@Component({
  selector: 'app-marketplace-action-buttons',
  templateUrl: './marketplace-action-buttons.component.html',
  styleUrls: [ './marketplace-action-buttons.component.scss' ]
})
export class MarketplaceActionButtonsComponent implements OnDestroy, OnChanges {
  @Input() availableActions: ActionButtonType[] = [];

  @Input() dataProduct: DataProduct;

  @Input() blockchainDataProduct?: BlockchainDataProduct;

  @Input() blockchainDataProductOrder?: BlockchainDataProductOrder;

  fundsToWithdraw?: BigNumber;

  loading = true;

  actionButtonType = ActionButtonType;

  private _walletSubscription: Subscription;

  private _wallet: Wallet;

  constructor(
    private _dataProductService: DataProductService,
    private _walletService: WalletService
  ) {
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  ngOnDestroy() {
    this._walletSubscription.unsubscribe();
  }

  ngOnChanges() {
    this._fetchDataFromBlockchain();
  }

  private _onWalletChange(wallet: Wallet): Promise<void> {
    this._wallet = wallet;
    return this._fetchDataFromBlockchain();
  }

  private async _fetchDataFromBlockchain(): Promise<void> {
    if (this.dataProduct && this._wallet) {
      if (this.dataProduct.address) {
        this.loading = true;

        if (!this.blockchainDataProductOrder) {
          this.blockchainDataProductOrder = await this._dataProductService.getOrderData(this.dataProduct.address, this._wallet.address);
        }

        if (this.dataProduct.blockchainState) {
          this.blockchainDataProduct = this.dataProduct.blockchainState;
        } else if (!this.blockchainDataProduct) {
          this.blockchainDataProduct = await this._dataProductService.getDataProductData(this.dataProduct.address);
        }
      }
      this.loading = false;
    }
  }
}
