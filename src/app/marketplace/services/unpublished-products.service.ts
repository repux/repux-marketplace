import { Injectable } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { DataProduct } from '../../shared/models/data-product';
import { TaskManagerService } from '../../services/task-manager.service';
import { FileUploadTask } from '../../tasks/file-upload-task';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class UnpublishedProductsService {
  private static readonly STORAGE_KEY = 'UnpublishedProductsService';
  private readonly _defaultData = {
    dataProducts: []
  };
  private readonly _config;
  private _productsSubject = new BehaviorSubject<DataProduct[]>([]);

  constructor(
    private _taskManagerService: TaskManagerService,
    private _storageService: StorageService) {
    this._config = this._readFromStore();
    this._productsSubject.next(this._config.dataProducts.slice());
  }

  getProducts(): Observable<DataProduct[]> {
    return this._productsSubject.asObservable();
  }

  addProduct(dataProduct: DataProduct): void {
    this._config.dataProducts.push(dataProduct);
    this._productsSubject.next(this._config.dataProducts.slice());
    this._saveToStore(this._config);
  }

  removeProduct(dataProduct: DataProduct): void {
    const index = this._config.dataProducts.indexOf(dataProduct);
    if (index !== -1) {
      this._config.dataProducts.splice(index, 1);
      this._productsSubject.next(this._config.dataProducts.slice());
      this._saveToStore(this._config);
    }

    const foundTask = this._taskManagerService.tasks.find(task =>
      (<FileUploadTask> task).sellerMetaHash &&
      (<FileUploadTask> task).sellerMetaHash === dataProduct.sellerMetaHash
    );

    if (foundTask) {
      this._taskManagerService.removeTask(foundTask);
    }
  }

  private _getStorageKey(): string {
    return UnpublishedProductsService.STORAGE_KEY;
  }

  private _readFromStore(): any {
    const saved = this._storageService.getItem(this._getStorageKey());

    if (saved) {
      return saved;
    }

    this._saveToStore(this._defaultData);
    return this._defaultData;
  }

  private _saveToStore(data: any): void {
    this._storageService.setItem(this._getStorageKey(), data);
  }
}
