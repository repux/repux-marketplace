import { Component, Input, OnInit } from '@angular/core';
import { DataProduct } from '../data-product';
import { MatDialog } from '@angular/material';
import { DataProductService } from '../services/data-product.service';
import { WalletService } from '../services/wallet.service';
import Wallet from '../wallet';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';

@Component({
  selector: 'app-unpublish-button',
  templateUrl: './unpublish-button.component.html',
  styleUrls: [ './unpublish-button.component.scss' ]
})
export class UnpublishButtonComponent implements OnInit {
  @Input() dataProduct: DataProduct;
  public dataProductAddress: string;
  public wallet: Wallet;
  public userIsOwner: boolean;

  constructor(
    private _walletService: WalletService,
    private _dataProductService: DataProductService,
    private _dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.dataProductAddress = this.dataProduct.address;
    this._walletService.getWallet().subscribe(wallet => this._onWalletChange(wallet));
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

  unpublish() {
    const transactionDialogRef = this._dialog.open(TransactionDialogComponent, {
      disableClose: true
    });
    transactionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userIsOwner = false;
      }
    });
    const transactionDialog: TransactionDialogComponent = transactionDialogRef.componentInstance;
    transactionDialog.transaction = () => this._dataProductService.disableDataProduct(this.dataProductAddress);
    transactionDialog.callTransaction();
  }
}
