import { Component, OnDestroy, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BigNumber } from 'bignumber.js';
import { FileUploadTask } from '../../tasks/file-upload-task';
import { RepuxLibService } from '../../services/repux-lib.service';
import { FileInputComponent } from '../../shared/components/file-input/file-input.component';
import { TaskManagerService } from '../../services/task-manager.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DataProductService } from '../../services/data-product.service';
import { KeyStoreService } from '../../key-store/key-store.service';
import { KeysPasswordDialogComponent } from '../../key-store/keys-password-dialog/keys-password-dialog.component';
import { KeysGeneratorDialogComponent } from '../../key-store/keys-generator-dialog/keys-generator-dialog.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { UnpublishedProductsService } from '../../services/unpublished-products.service';
import {
  MarketplaceProductCategorySelectorComponent
} from '../marketplace-product-category-selector/marketplace-product-category-selector.component';
import { DataProductNotificationsService } from '../../services/data-product-notifications.service';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';

@Component({
  selector: 'app-marketplace-product-creator-dialog',
  templateUrl: './marketplace-product-creator-dialog.component.html',
  styleUrls: [ './marketplace-product-creator-dialog.component.scss' ]
})
export class MarketplaceProductCreatorDialogComponent implements OnDestroy {
  public currencyName: string = environment.repux.currency.defaultName;
  public formGroup: FormGroup;
  public titleMinLength = 3;
  public titleMaxLength = 100;
  public repuxPrecision: number = environment.repux.currency.precision;
  @ViewChild('fileInput') fileInput: FileInputComponent;
  @ViewChild('categoryInput') categoryInput: MarketplaceProductCategorySelectorComponent;
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
  private subscription: Subscription;

  constructor(
    private tagManager: TagManagerService,
    private keyStoreService: KeyStoreService,
    private repuxLibService: RepuxLibService,
    private dataProductService: DataProductService,
    private taskManagerService: TaskManagerService,
    private _unpublishedProductsService: UnpublishedProductsService,
    private _dataProductNotificationsService: DataProductNotificationsService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<MarketplaceProductCreatorDialogComponent>) {
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

  get daysForDeliverOptions() {
    return Array.from(Array(environment.repux.maxDaysForDeliver + 1).keys());
  }

  async upload() {
    if (!this.formGroup.valid) {
      return;
    }

    this.tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.CreateDataProduct,
      this.formGroup.value.title,
      this.formGroup.value.price
    );

    const { publicKey } = await this.getKeys();

    this.tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.CreateConfirmedDataProduct,
      this.formGroup.value.title,
      this.formGroup.value.price
    );

    const fileUploadTask = new FileUploadTask(
      publicKey,
      this.repuxLibService,
      this.dataProductService,
      this._unpublishedProductsService,
      this._dataProductNotificationsService,
      this.formGroup.value.title,
      this.formGroup.value.shortDescription,
      this.formGroup.value.fullDescription,
      this.categoryInput.value,
      new BigNumber(this.formGroup.value.price),
      this.fileInput.value[ 0 ],
      this.formGroup.value.daysForDeliver,
      this.dialog,
      this.tagManager
    );

    this.taskManagerService.addTask(fileUploadTask);
    this.dialogRef.close(true);
  }

  closeDialog() {
    this.tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.CreateDataProductCancel,
      this.formGroup.value.title,
      this.formGroup.value.price
    );

    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
}
