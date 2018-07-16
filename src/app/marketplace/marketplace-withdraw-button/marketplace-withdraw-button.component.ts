import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../../shared/models/data-product';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import BigNumber from 'bignumber.js';
import { DataProductService } from '../../services/data-product.service';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';

@Component({
  selector: 'app-marketplace-withdraw-button',
  templateUrl: './marketplace-withdraw-button.component.html',
  styleUrls: [ './marketplace-withdraw-button.component.scss' ]
})
export class MarketplaceWithdrawButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  public dataProductAddress: string;
  public wallet: Wallet;
  public userIsOwner: boolean;
  public fundsToWithdraw: BigNumber;

  private _walletSubscription: Subscription;

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _dialog: MatDialog,
    private _tagManager: TagManagerService
  ) {
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  getUserIsOwner(): boolean {
    return this.wallet.address === this.dataProduct.ownerAddress;
  }

  withdraw() {
    this._tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.Withdraw,
      this.dataProduct.title,
      this.dataProduct.fundsToWithdraw ? this.dataProduct.fundsToWithdraw.toString() : ''
    );

    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataProduct.fundsToWithdraw = new BigNumber(0);
        this._tagManager.sendEvent(
          EventCategory.Sell,
          EventAction.WithdrawConfirmed,
          this.dataProduct.title,
          this.dataProduct.fundsToWithdraw ? this.dataProduct.fundsToWithdraw.toString() : ''
        );
      }
    });
    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.withdrawFundsFromDataProduct(this.dataProductAddress);
    return transactionDialog.callTransaction();
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
