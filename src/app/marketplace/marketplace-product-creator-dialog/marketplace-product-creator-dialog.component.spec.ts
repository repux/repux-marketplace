import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceProductCreatorDialogComponent } from './marketplace-product-creator-dialog.component';
import { MatDialogRef } from '@angular/material';
import { TaskManagerService } from '../../services/task-manager.service';
import { RepuxLibService } from '../../services/repux-lib.service';
import { DataProductService } from '../../services/data-product.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KeyStoreService } from '../../key-store/key-store.service';
import { KeyStoreModule } from '../../key-store/key-store.module';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material.module';
import {
  MarketplaceProductCategorySelectorComponent
} from '../marketplace-product-category-selector/marketplace-product-category-selector.component';
import { TagManagerService } from '../../shared/services/tag-manager.service';

describe('MarketplaceProductCreatorDialogComponent', () => {
  let tagManagerService, keyStoreService, repuxLibService, dataProductService, taskManagerService, matDialog, matDialogRef,
    getKeys, unpublishedProductsService;
  let component: MarketplaceProductCreatorDialogComponent;
  let fixture: ComponentFixture<MarketplaceProductCreatorDialogComponent>;

  beforeEach(async(() => {
    tagManagerService = jasmine.createSpyObj('TagManagerService', [ 'sendUserId', 'sendEvent' ]);
    keyStoreService = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys' ]);
    repuxLibService = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    repuxLibService.getInstance.and.returnValue({
      createFileUploader: jasmine.createSpy()
    });

    dataProductService = jasmine.createSpyObj('DataProductService', [ 'publishDataProduct' ]);
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'addTask' ]);
    unpublishedProductsService = jasmine.createSpyObj('UnpublishedProductsService', [ 'addProduct', 'removeProduct' ]);
    matDialogRef = jasmine.createSpyObj('MatDialogRef', [ 'close', 'afterClosed' ]);
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceProductCreatorDialogComponent,
        MarketplaceProductCategorySelectorComponent
      ],
      imports: [
        SharedModule,
        KeyStoreModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NoopAnimationsModule,
        MaterialModule
      ],
      providers: [
        { provide: TagManagerService, useValue: tagManagerService },
        { provide: KeyStoreService, useValue: keyStoreService },
        { provide: MatDialogRef, useValue: matDialogRef },
        { provide: RepuxLibService, useValue: repuxLibService },
        { provide: TaskManagerService, useValue: taskManagerService },
        { provide: DataProductService, useValue: dataProductService },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceProductCreatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#constructor()', () => {
    it('should initialize formGroup property', () => {
      component = new MarketplaceProductCreatorDialogComponent(
        tagManagerService,
        keyStoreService,
        repuxLibService,
        dataProductService,
        taskManagerService,
        unpublishedProductsService,
        matDialog,
        matDialogRef
      );

      expect(component.formGroup.controls[ 'title' ]).toBe(component.titleFormControl);
      expect(component.formGroup.controls[ 'shortDescription' ]).toBe(component.shortDescriptionFormControl);
      expect(component.formGroup.controls[ 'fullDescription' ]).toBe(component.fullDescriptionFormControl);
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
      expect(repuxLibService.getInstance.calls.count()).toBe(0);
    });

    it('should add new FileUploadTask to taskManagerService', async () => {
      const title = 'TITLE';
      const shortDescription = 'SHORT_DESCRIPTION';
      const fullDescription = 'FULL_DESCRIPTION';
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
          fullDescription,
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
