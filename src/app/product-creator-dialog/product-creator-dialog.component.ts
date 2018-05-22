import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from "../../environments/environment";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { BigNumber } from "bignumber.js";
import { FileUploadTask } from "../tasks/file-upload-task";
import { RepuxLibService } from "../repux-lib.service";
import { FileInputComponent } from "../file-input/file-input.component";
import { ProductCategorySelectorComponent } from "../product-category-selector/product-category-selector.component";
import { TaskManagerService } from "../task-manager/task-manager.service";
import { MatDialogRef } from "@angular/material";
import { DataProductService } from "../data-product.service";

@Component({
  selector: 'app-product-creator-dialog',
  templateUrl: './product-creator-dialog.component.html',
  styleUrls: ['./product-creator-dialog.component.scss']
})
export class ProductCreatorDialogComponent implements OnInit {
  public currencyName: string = environment.repux.currency.defaultName;
  public formGroup: FormGroup;
  public titleMinLength: number = 3;
  public titleMaxLength: number = 100;
  public repuxPrecision: number = environment.repux.currency.precision;

  @ViewChild('fileInput') fileInput: FileInputComponent;
  @ViewChild('categoryInput') categoryInput: ProductCategorySelectorComponent;

  public titleFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(this.titleMinLength),
    Validators.maxLength(this.titleMaxLength)
  ]);

  public longDescriptionFormControl = new FormControl('', []);

  public shortDescriptionFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(1023)
  ]);

  public categoryFormControl = new FormControl([], [
    Validators.required
  ]);

  public priceControl = new FormControl('', [
    Validators.required,
    Validators.min(0),
    Validators.pattern(environment.repux.currency.pattern)
  ]);

  public fileControl = new FormControl('', [
    Validators.required
  ]);

  constructor(
    private repuxLibService: RepuxLibService,
    private dataProductService: DataProductService,
    private taskManagerService: TaskManagerService,
    public dialogRef: MatDialogRef<ProductCreatorDialogComponent>) {
    this.formGroup = new FormGroup({
      title: this.titleFormControl,
      shortDescription: this.shortDescriptionFormControl,
      longDescription: this.longDescriptionFormControl,
      category: this.categoryFormControl,
      price: this.priceControl,
      file: this.fileControl
    });
  }

  ngOnInit() {
  }

  async upload() {
    if (!this.formGroup.valid) {
      return;
    }

    const keys = await this.repuxLibService.getClass().generateAsymmetricKeyPair();

    const fileUploadTask = new FileUploadTask(
      keys.publicKey,
      this.repuxLibService,
      this.dataProductService,
      this.formGroup.value.title,
      this.formGroup.value.shortDescription,
      this.formGroup.value.longDescription,
      this.categoryInput.value,
      new BigNumber(this.formGroup.value.price),
      this.fileInput.value[0]
    );

    this.taskManagerService.addTask(fileUploadTask);
    this.dialogRef.close(true);
  }
}
