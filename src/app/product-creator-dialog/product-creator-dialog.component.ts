import { Component, OnDestroy, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BigNumber } from 'bignumber.js';
import { FileUploadTask } from '../tasks/file-upload-task';
import { RepuxLibService } from '../services/repux-lib.service';
import { FileInputComponent } from '../file-input/file-input.component';
import { ProductCategorySelectorComponent } from '../product-category-selector/product-category-selector.component';
import { TaskManagerService } from '../services/task-manager.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DataProductService } from '../services/data-product.service';
import { KeyStoreService } from '../key-store/key-store.service';
import { KeysPasswordDialogComponent } from '../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { UnpublishedProductsService } from '../services/unpublished-products.service';

@Component({
  selector: 'app-product-creator-dialog',
  templateUrl: './product-creator-dialog.component.html',
  styleUrls: [ './product-creator-dialog.component.scss' ]
})
export class ProductCreatorDialogComponent implements OnDestroy {
  private subscription: Subscription;

  public currencyName: string = environment.repux.currency.defaultName;
  public formGroup: FormGroup;
  public titleMinLength = 3;
  public titleMaxLength = 100;
  public repuxPrecision: number = environment.repux.currency.precision;

  @ViewChild('fileInput') fileInput: FileInputComponent;
  @ViewChild('categoryInput') categoryInput: ProductCategorySelectorComponent;

  public titleFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(this.titleMinLength),
    Validators.maxLength(this.titleMaxLength)
  ]);

  public fullDescriptionFormControl = new FormControl('', []);

  public shortDescriptionFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(1023)
  ]);

  public categoryFormControl = new FormControl([], [
    Validators.required
  ]);

  public priceFormControl = new FormControl('', [
    Validators.required,
    Validators.min(0),
    Validators.pattern(environment.repux.currency.pattern)
  ]);

  public fileFormControl = new FormControl('', [
    Validators.required
  ]);

  public daysForDeliverFormControl = new FormControl(1, [
    Validators.required
  ]);

  constructor(
    private keyStoreService: KeyStoreService,
    private repuxLibService: RepuxLibService,
    private dataProductService: DataProductService,
    private taskManagerService: TaskManagerService,
    private _unpublishedProductsService: UnpublishedProductsService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ProductCreatorDialogComponent>) {
    this.formGroup = new FormGroup({
      title: this.titleFormControl,
      shortDescription: this.shortDescriptionFormControl,
      fullDescription: this.fullDescriptionFormControl,
      category: this.categoryFormControl,
      price: this.priceFormControl,
      file: this.fileFormControl,
      daysForDeliver: this.daysForDeliverFormControl
    });
  }

  async upload() {
    if (!this.formGroup.valid) {
      return;
    }

    const { publicKey } = await this.getKeys();

    const fileUploadTask = new FileUploadTask(
      publicKey,
      this.repuxLibService,
      this.dataProductService,
      this._unpublishedProductsService,
      this.formGroup.value.title,
      this.formGroup.value.shortDescription,
      this.formGroup.value.fullDescription,
      this.categoryInput.value,
      new BigNumber(this.formGroup.value.price),
      this.fileInput.value[ 0 ],
      this.formGroup.value.daysForDeliver,
    );

    this.taskManagerService.addTask(fileUploadTask);
    this.dialogRef.close(true);
  }

  private getKeys(): Promise<{ privateKey: JsonWebKey, publicKey: JsonWebKey }> {
    return new Promise(resolve => {
      let dialogRef;

      if (this.keyStoreService.hasKeys()) {
        dialogRef = this.dialog.open(KeysPasswordDialogComponent);
      } else {
        dialogRef = this.dialog.open(KeysGeneratorDialogComponent);
      }

      this.subscription = dialogRef.afterClosed().subscribe(result => {
        if (result) {
          resolve({
            privateKey: result.privateKey,
            publicKey: result.publicKey
          });
        }
      });
    });
  }

  get daysForDeliverOptions() {
    return Array.from(Array(environment.repux.maxDaysForDeliver + 1).keys());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
