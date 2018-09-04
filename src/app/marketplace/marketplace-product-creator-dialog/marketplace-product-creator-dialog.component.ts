import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BigNumber } from 'bignumber.js';
import { FileUploadTask } from '../../tasks/file-upload-task';
import { RepuxLibService } from '../../services/repux-lib.service';
import { FileInputComponent } from '../../shared/components/file-input/file-input.component';
import { TaskManagerService } from '../../services/task-manager.service';
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';
import { UnpublishedProductsService } from '../services/unpublished-products.service';
import {
  MarketplaceProductCategorySelectorComponent
} from '../marketplace-product-category-selector/marketplace-product-category-selector.component';
import { EventAction, EventCategory, TagManagerService } from '../../shared/services/tag-manager.service';
import { IpfsService } from '../../services/ipfs.service';
import { createEulaSelection } from '../marketplace-eula-selector/marketplace-eula-selector.component';
import { PurchaseType } from 'repux-lib';
import { WalletService } from '../../services/wallet.service';
import Wallet from '../../shared/models/wallet';
import { TransactionService } from '../../shared/services/transaction.service';
import { SettingsService } from '../../settings/services/settings.service';
import { KeyStoreDialogService } from '../../key-store/key-store-dialog.service';
import { BlobDownloader } from '../../shared/utils/blob-downloader';

@Component({
  selector: 'app-marketplace-product-creator-dialog',
  templateUrl: './marketplace-product-creator-dialog.component.html',
  styleUrls: [ './marketplace-product-creator-dialog.component.scss' ]
})
export class MarketplaceProductCreatorDialogComponent implements OnInit, OnDestroy {
  @Input() dialogTitle = 'Add data file to Marketplace';
  @Input() title: string;
  @Input() file: File;
  @Input() shortDescription: string;

  public formGroup: FormGroup;
  public titleMinLength = 3;
  public titleMaxLength = 100;
  public shortDescriptionMinLength = 3;
  public shortDescriptionMaxLength = 1023;
  public longDescriptionMaxLength = 10000;
  public maxFileSize: number = environment.ipfs.maxFileSize;
  public wallet: Wallet;
  @ViewChild('fileInput') fileInput: FileInputComponent;
  @ViewChild('sampleFileInput') sampleFileInput: FileInputComponent;
  @ViewChild('categoryInput') categoryInput: MarketplaceProductCategorySelectorComponent;
  private subscription: Subscription;
  private walletSubscription: Subscription;

  constructor(
    private tagManager: TagManagerService,
    private formBuilder: FormBuilder,
    private repuxLibService: RepuxLibService,
    private taskManagerService: TaskManagerService,
    private unpublishedProductsService: UnpublishedProductsService,
    private ipfsService: IpfsService,
    private walletService: WalletService,
    private settingsService: SettingsService,
    private transactionService: TransactionService,
    private keyStoreDialogService: KeyStoreDialogService,
    public dialogRef: MatDialogRef<MarketplaceProductCreatorDialogComponent>) {
    this.walletSubscription = this.walletService.getWallet().subscribe(wallet => this.wallet = wallet);

    this.formGroup = this.formBuilder.group({
      title: [ '', [
        Validators.required,
        Validators.minLength(this.titleMinLength),
        Validators.maxLength(this.titleMaxLength)
      ] ],
      shortDescription: [ '', [
        Validators.required,
        Validators.minLength(this.shortDescriptionMinLength),
        Validators.maxLength(this.shortDescriptionMaxLength)
      ] ],
      fullDescription: [ '', [
        Validators.maxLength(this.longDescriptionMaxLength)
      ] ],
      category: [ [], [
        Validators.required
      ] ],
      price: [ '', [
        Validators.required
      ] ],
      file: [ [], [
        Validators.required
      ] ],
      sampleFile: [ '', [] ],
      eula: [ null, [
        Validators.required
      ] ]
    });
  }

  async ngOnInit() {
    this.formGroup.controls[ 'eula' ].setValue(await createEulaSelection());

    if (this.file) {
      this.formGroup.controls[ 'file' ].setValue(this.file.name);
      this.formGroup.controls[ 'file' ].disable();
    }

    if (this.title) {
      this.formGroup.controls[ 'title' ].setValue(this.title);
    }

    if (this.shortDescription) {
      this.formGroup.controls[ 'shortDescription' ].setValue(this.shortDescription);
    }
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

    const { publicKey } = await this.keyStoreDialogService.getKeys({ publicKey: true });

    this.tagManager.sendEvent(
      EventCategory.Sell,
      EventAction.CreateConfirmedDataProduct,
      this.formGroup.value.title,
      this.formGroup.value.price
    );

    const fileUploadTask = new FileUploadTask(
      this.wallet.address,
      publicKey,
      this.formGroup.value.title,
      this.formGroup.value.shortDescription,
      this.formGroup.value.fullDescription,
      this.categoryInput.value,
      new BigNumber(this.formGroup.value.price),
      (this.file) ? this.file : this.fileInput.value[ 0 ],
      this.settingsService.daysToDeliver,
      this.sampleFileInput.value,
      this.formGroup.value.eula,
      -1,
      PurchaseType.ONE_TIME_PURCHASE,
      this.repuxLibService,
      this.unpublishedProductsService,
      this.ipfsService,
      this.transactionService
    );

    this.taskManagerService.addTask(fileUploadTask);
    this.dialogRef.close(true);
  }

  downloadFile(): Promise<void> {
    const downloader = new BlobDownloader();
    return downloader.downloadBlob(URL.createObjectURL(this.file), this.file.name);
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

    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }
  }
}
