import { Injectable, OnDestroy } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { DataProduct } from '../../shared/models/data-product';
import { TaskManagerService } from '../../services/task-manager.service';
import { FileUploadTask } from '../../tasks/file-upload-task';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnpublishedProductsService implements OnDestroy {
  private static readonly STORAGE_KEY = 'UnpublishedProductsService';
  private config;
  private productsSubject = new BehaviorSubject<DataProduct[]>([]);
  private wallet: Wallet;
  private walletSubscription: Subscription;

  constructor(
    private taskManagerService: TaskManagerService,
    private storageService: StorageService,
    private walletService: WalletService) {
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.onWalletChange(wallet));
  }

  getProducts(): Observable<DataProduct[]> {
    return this.productsSubject.asObservable();
  }

  addProduct(dataProduct: DataProduct, walletAddress?: string): void {
    if (walletAddress && this.wallet.address !== walletAddress) {
      const config = this.readFromStore(walletAddress);
      config.dataProducts.push(dataProduct);
      this.saveToStore(config, walletAddress);

      return;
    }

    this.config.dataProducts.push(dataProduct);
    this.productsSubject.next(this.config.dataProducts.slice());
    this.saveToStore(this.config);
  }

  ngOnDestroy(): void {
    this.walletSubscription.unsubscribe();
  }

  onWalletChange(wallet: Wallet): void {
    if (!wallet) {
      return;
    }

    this.wallet = wallet;
    this.config = this.readFromStore();
    this.productsSubject.next(this.config.dataProducts.slice());
  }

  removeProduct(dataProduct: DataProduct): void {
    const index = this.config.dataProducts.indexOf(dataProduct);
    if (index !== -1) {
      this.config.dataProducts.splice(index, 1);
      this.productsSubject.next(this.config.dataProducts.slice());
      this.saveToStore(this.config);
    }

    const foundTask = this.taskManagerService.tasks.find(task =>
      (<FileUploadTask> task).sellerMetaHash &&
      (<FileUploadTask> task).sellerMetaHash === dataProduct.sellerMetaHash
    );

    if (foundTask) {
      this.taskManagerService.removeTask(foundTask);
    }
  }

  private getStorageKey(walletAddress?: string): string {
    return UnpublishedProductsService.STORAGE_KEY + '_' + (walletAddress ? walletAddress : this.wallet.address);
  }

  private readFromStore(walletAddress?: string): any {
    const saved = this.storageService.getItem(this.getStorageKey(walletAddress));

    if (saved) {
      return saved;
    }

    const data = { dataProducts: [] };
    this.saveToStore(data);

    return data;
  }

  private saveToStore(data: any, walletAddress?: string): void {
    this.storageService.setItem(this.getStorageKey(walletAddress), data);
  }
}
