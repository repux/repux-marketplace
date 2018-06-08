import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCreatorDialogComponent } from './product-creator-dialog.component';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatInputModule,
  MatSelectModule
} from '@angular/material';
import { TaskManagerService } from '../services/task-manager.service';
import { RepuxLibService } from '../services/repux-lib.service';
import { DataProductService } from '../services/data-product.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductCategorySelectorComponent } from '../product-category-selector/product-category-selector.component';
import { FileInputComponent } from '../file-input/file-input.component';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KeyStoreService } from '../key-store/key-store.service';
import { KeyStoreModule } from '../key-store/key-store.module';

describe('ProductCreatorDialogComponent', () => {
  let keyStoreService, repuxLibService, dataProductService, taskManagerService, matDialog, matDialogRef,
    getKeys;
  let component: ProductCreatorDialogComponent;
  let fixture: ComponentFixture<ProductCreatorDialogComponent>;

  beforeEach(async(() => {
    keyStoreService = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys' ]);
    repuxLibService = jasmine.createSpyObj('RepuxLibService', [ 'getClass', 'getInstance' ]);
    repuxLibService.getInstance.and.returnValue({
      createFileUploader: jasmine.createSpy()
    });

    dataProductService = jasmine.createSpyObj('DataProductService', [ 'publishDataProduct' ]);
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'addTask' ]);
    matDialogRef = jasmine.createSpyObj('MatDialogRef', [ 'close', 'afterClosed' ]);
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        ProductCreatorDialogComponent,
        ProductCategorySelectorComponent,
        FileInputComponent
      ],
      imports: [
        KeyStoreModule,
        MatDialogModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        HttpClientModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: KeyStoreService, useValue: keyStoreService },
        { provide: MatDialogRef, useValue: matDialogRef },
        { provide: RepuxLibService, useValue: repuxLibService },
        { provide: TaskManagerService, useValue: taskManagerService },
        { provide: DataProductService, useValue: dataProductService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductCreatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#constructor()', () => {
    it('should initialize formGroup property', () => {
      component = new ProductCreatorDialogComponent(keyStoreService, repuxLibService,
        dataProductService, taskManagerService, matDialog, matDialogRef);
      expect(component.formGroup.controls[ 'title' ]).toBe(component.titleFormControl);
      expect(component.formGroup.controls[ 'shortDescription' ]).toBe(component.shortDescriptionFormControl);
      expect(component.formGroup.controls[ 'longDescription' ]).toBe(component.longDescriptionFormControl);
      expect(component.formGroup.controls[ 'category' ]).toBe(component.categoryFormControl);
      expect(component.formGroup.controls[ 'price' ]).toBe(component.priceFormControl);
      expect(component.formGroup.controls[ 'file' ]).toBe(component.fileFormControl);
    });
  });

  describe('#upload', () => {
    it('shouldn\'t do anything when form is invalid', async () => {
      component.formGroup = <any> {
        valid: false
      };

      await component.upload();
      expect(repuxLibService.getClass.calls.count()).toBe(0);
    });

    it('should add new FileUploadTask to taskManagerService', async () => {
      const title = 'TITLE';
      const shortDescription = 'SHORT_DESCRIPTION';
      const longDescription = 'LONG_DESCRIPTION';
      const price = '12.23';
      const publicKey = 'PUBLIC_KEY';
      const file = 'FILE';

      getKeys = spyOn<any>(component, 'getKeys');
      getKeys.and.returnValue(Promise.resolve({
        publicKey
      }));

      component.fileInput = <any> { value: [ file ] };
      component.formGroup = <any> {
        value: {
          title,
          shortDescription,
          longDescription,
          price
        },
        valid: true
      };

      await component.upload();
      expect(taskManagerService.addTask.calls.count()).toBe(1);
      expect(getKeys.calls.count()).toBe(1);
      expect(matDialogRef.close.calls.count()).toBe(1);
    });
  });
});
