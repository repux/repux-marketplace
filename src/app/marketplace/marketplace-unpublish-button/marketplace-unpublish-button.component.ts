import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { MatDialog } from '@angular/material';
import { DataProductService } from '../../services/data-product.service';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProductNotificationsService } from '../../services/data-product-notifications.service';

@Component({
  selector: 'app-marketplace-unpublish-button',
  templateUrl: './marketplace-unpublish-button.component.html',
  styleUrls: [ './marketplace-unpublish-button.component.scss' ]
})
export class MarketplaceUnpublishButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  public dataProductAddress: string;
  public wallet: Wallet;
  public userIsOwner: boolean;

  private _walletSubscription: Subscription;

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _dataProductNotificationsService: DataProductNotificationsService,
    private _dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  getUserIsOwner(): boolean {
    return this.wallet.address === this.dataProduct.ownerAddress;
  }

  unpublish() {
    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._dataProductNotificationsService.removeCreatedProductAddress(this.dataProductAddress);
        this.dataProduct.disabled = true;
      }
    });
    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.disableDataProduct(this.dataProductAddress);
    transactionDialog.callTransaction();
  }

  ngOnDestroy() {
    if (this._walletSubscription) {
      this._walletSubscription.unsubscribe();
    }
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }
}
