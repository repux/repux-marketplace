import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';
import { WalletService } from '../services/wallet.service';
import Wallet from '../shared/models/wallet';
import BigNumber from 'bignumber.js';
import { DataProductService } from '../services/data-product.service';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-withdraw-button',
  templateUrl: './withdraw-button.component.html',
  styleUrls: [ './withdraw-button.component.scss' ]
})
export class WithdrawButtonComponent implements OnInit, OnDestroy {
  @Input() dataProduct: DataProduct;
  public dataProductAddress: string;
  public wallet: Wallet;
  public userIsOwner: boolean;
  public fundsToWithdraw: BigNumber;

  private _walletSubscription: Subscription;

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;
    this._walletSubscription = this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
  }

  private _onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }

  getUserIsOwner(): boolean {
    return this.wallet.address === this.dataProduct.ownerAddress;
  }

  withdraw() {
    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataProduct.fundsToWithdraw = new BigNumber(0);
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
}
