import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import {
  MarketplaceProductCategorySelectorComponent
} from '../marketplace-product-category-selector/marketplace-product-category-selector.component';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { IpfsService } from '../../services/ipfs.service';
import { createEulaSelection } from '../marketplace-eula-selector/marketplace-eula-selector.component';
import { PurchaseType } from 'repux-lib';

@Component({
  selector: 'app-marketplace-product-creator-dialog',
  templateUrl: './marketplace-product-creator-dialog.component.html',
  styleUrls: [ './marketplace-product-creator-dialog.component.scss' ]
})
export class MarketplaceProductCreatorDialogComponent implements OnInit, OnDestroy {
  public currencyName: string = environment.repux.currency.defaultName;
  public formGroup: FormGroup;
  public titleMinLength = 3;
  public titleMaxLength = 100;
  public maxFileSize: number = environment.ipfs.maxFileSize;
  public repuxPrecision: number = environment.repux.currency.precision;
  @ViewChild('fileInput') fileInput: FileInputComponent;
  @ViewChild('sampleFileInput') sampleFileInput: FileInputComponent;
  @ViewChild('categoryInput') categoryInput: MarketplaceProductCategorySelectorComponent;
  private subscription: Subscription;

  constructor(
    private tagManager: TagManagerService,
    private formBuilder: FormBuilder,
    private keyStoreService: KeyStoreService,
    private repuxLibService: RepuxLibService,
    private dataProductService: DataProductService,
    private taskManagerService: TaskManagerService,
    private unpublishedProductsService: UnpublishedProductsService,
    private ipfsService: IpfsService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<MarketplaceProductCreatorDialogComponent>) {

    this.formGroup = this.formBuilder.group({
      title: [ '', [
        Validators.required,
        Validators.minLength(this.titleMinLength),
        Validators.maxLength(this.titleMaxLength)
      ] ],
      shortDescription: [ '', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(1023)
      ] ],
      fullDescription: [ '', [] ],
      category: [ [], [
        Validators.required
      ] ],
      price: [ '', [
        Validators.required,
        Validators.min(0),
        Validators.pattern(environment.repux.currency.pattern)
      ] ],
      file: [ [], [
        Validators.required
      ] ],
      sampleFile: [ '', [] ],
      daysForDeliver: [ 1, [
        Validators.required
      ] ],
      eula: [ null, [
        Validators.required
      ] ]
    });
  }

  get daysForDeliverOptions() {
    return Array.from(Array(environment.repux.maxDaysForDeliver + 1).keys());
  }

  async ngOnInit() {
    this.formGroup.controls[ 'eula' ].setValue(await createEulaSelection());
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
      this.formGroup.value.title,
      this.formGroup.value.shortDescription,
      this.formGroup.value.fullDescription,
      this.categoryInput.value,
      new BigNumber(this.formGroup.value.price),
      this.fileInput.value[ 0 ],
      this.formGroup.value.daysForDeliver,
      this.sampleFileInput.value,
      this.formGroup.value.eula,
      -1,
      PurchaseType.ONE_TIME_PURCHASE,
      this.dialog,
      this.repuxLibService,
      this.dataProductService,
      this.unpublishedProductsService,
      this.ipfsService,
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
