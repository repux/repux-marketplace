import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DataProductOrder } from '../../shared/models/data-product-order';
import { Subscription } from 'rxjs';
import { DataProduct } from '../../shared/models/data-product';
import { RepuxLibService } from '../../services/repux-lib.service';
import { DataProductService } from '../../services/data-product.service';
import Wallet from '../../shared/models/wallet';
import { WalletService } from '../../services/wallet.service';
import { PendingFinalisationService } from '../services/pending-finalisation.service';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import { EventType, FileReencryptor } from '@repux/repux-lib';
import {
  TransactionReceipt,
  TransactionStatus,
  DataProductOrder as BlockchainDataProductOrder,
  DataProduct as BlockchainDataProduct
} from '@repux/repux-web3-api';
import { Transaction, TransactionService } from '../../shared/services/transaction.service';
import { BlockchainTransactionScope } from '../../shared/enums/blockchain-transaction-scope';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { KeyStoreDialogService } from '../../key-store/key-store-dialog.service';

@Component({
  selector: 'app-marketplace-finalise-button',
  templateUrl: './marketplace-finalise-button.component.html'
})
export class MarketplaceFinaliseButtonComponent implements OnDestroy, OnInit {
  @Input() order: DataProductOrder;
  @Input() dataProduct: DataProduct;
  @Input() blockchainDataProduct: BlockchainDataProduct;
  @Output() success = new EventEmitter<DataProductOrder>();

  public wallet: Wallet;
  public userIsOwner: boolean;
  public pendingTransaction?: Transaction;
  public pendingReencryption = false;
  public blockchainOrder: BlockchainDataProductOrder;

  private keysSubscription: Subscription;
  private walletSubscription: Subscription;
  private transactionsSubscription: Subscription;
  private reencryptor: FileReencryptor;

  constructor(
    private repuxLibService: RepuxLibService,
    private dataProductService: DataProductService,
    private pendingFinalisationService: PendingFinalisationService,
    private walletService: WalletService,
    private tagManager: TagManagerService,
    private commonDialogService: CommonDialogService,
    private keyStoreDialogServiceSpy: KeyStoreDialogService,
    private transactionService: TransactionService
  ) {
  }

  async ngOnInit() {
    this.blockchainOrder = await this.dataProductService.getOrderData(this.dataProduct.address, this.order.buyerAddress);

    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
    this.transactionsSubscription = this.transactionService.getTransactions()
      .subscribe(transactions => this.onTransactionsListChange(transactions));
  }

  getUserIsOwner(): boolean {
    return this.wallet.address === this.dataProduct.ownerAddress;
  }

  onTransactionFinish(transactionReceipt: TransactionReceipt) {
    if (transactionReceipt.status === TransactionStatus.SUCCESSFUL) {
      this.pendingFinalisationService.removeOrder(this.dataProduct.address, this.order.buyerAddress);

      this.order.finalised = true;
      this.success.emit(this.order);

      this.tagManager.sendEvent(
        EventCategory.Sell,
        EventAction.FinalizeOrderConfirmed,
        this.dataProduct.title,
        this.dataProduct.price ? this.dataProduct.price.toString() : ''
      );
    }

    delete this.pendingTransaction;
  }

  async onTransactionsListChange(transactions: Transaction[]) {
    const foundTransaction = transactions.find(transaction =>
      transaction.scope === BlockchainTransactionScope.DataProductOrder &&
      transaction.identifier === this.blockchainOrder.address &&
      transaction.blocksAction === ActionButtonType.Finalise
    );

    if (this.pendingTransaction && !foundTransaction) {
      this.onTransactionFinish(
        await this.transactionService.getTransactionReceipt(this.pendingTransaction.transactionHash)
      );
    } else {
      this.pendingTransaction = foundTransaction;
    }
  }

  async finalise() {
    this.tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.FinalizeOrder,
      this.dataProduct.title,
      this.dataProduct.price ? this.dataProduct.price.toString() : ''
    );

    const { privateKey } = await this.keyStoreDialogServiceSpy.getKeys();
    const publicKey = this.repuxLibService.getInstance().deserializePublicKey(this.order.publicKey);

    this.pendingReencryption = true;
    const metaHash = await this.reencrypt(privateKey, publicKey);

    this.pendingReencryption = false;
    return this.sendTransaction(metaHash);
  }

  ngOnDestroy() {
    if (this.keysSubscription) {
      this.keysSubscription.unsubscribe();
    }

    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }

    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }

  displayReencryptionErrorMessage() {
    this.commonDialogService.alert(
      'You can not re-encrypt the file. Please upload the key pair that was used during upload transaction.',
      'Re-encryption error'
    );
  }

  sendTransaction(result: string) {
    this.commonDialogService.transaction(
      () => this.dataProductService.finaliseDataProductPurchase(
        this.blockchainOrder.address,
        this.dataProduct.address,
        this.blockchainOrder.buyerAddress,
        result
      )
    );
  }

  async reencrypt(privateKey: JsonWebKey, publicKey: JsonWebKey): Promise<string> {
    this.reencryptor = this.repuxLibService.getInstance().createFileReencryptor();

    return new Promise<string>((resolve, reject) => {
      this.reencryptor.reencrypt(privateKey, publicKey, this.dataProduct.sellerMetaHash)
        .on(EventType.ERROR, () => {
          this.displayReencryptionErrorMessage();
          reject();
        })
        .on(EventType.FINISH, (_eventType, result) => {
          resolve(result);
        });
    });
  }

  private onWalletChange(wallet: Wallet) {
    if (!wallet || wallet === this.wallet) {
      return;
    }

    this.wallet = wallet;
    this.userIsOwner = this.getUserIsOwner();
  }
}
