import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceProductCreatorDialogComponent } from './marketplace-product-creator-dialog.component';
import { MatDialogRef } from '@angular/material';
import { TaskManagerService } from '../../services/task-manager.service';
import { RepuxLibService } from '../../services/repux-lib.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KeyStoreModule } from '../../key-store/key-store.module';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material.module';
import {
  MarketplaceProductCategorySelectorComponent
} from '../marketplace-product-category-selector/marketplace-product-category-selector.component';
import { TagManagerService } from '../../shared/services/tag-manager.service';
import { IpfsService } from '../../services/ipfs.service';
import { MarketplaceEulaSelectorComponent } from '../marketplace-eula-selector/marketplace-eula-selector.component';
import { from } from 'rxjs';
import Wallet from '../../shared/models/wallet';
import { TransactionService } from '../../shared/services/transaction.service';
import { SettingsService } from '../../settings/services/settings.service';
import { environment } from '../../../environments/environment';
import { KeyStoreDialogService } from '../../key-store/key-store-dialog.service';
import BigNumber from 'bignumber.js';

describe('MarketplaceProductCreatorDialogComponent', () => {
  let tagManagerServiceSpy, repuxLibServiceSpy, taskManagerServiceSpy, keyStoreDialogServiceSpy,
    matDialogRefSpy, unpublishedProductsServiceSpy, ipfsServiceSpy, walletServiceSpy, transactionServiceSpy, settingsServiceSpy;
  let formBuilder: FormBuilder;
  let component: MarketplaceProductCreatorDialogComponent;
  let fixture: ComponentFixture<MarketplaceProductCreatorDialogComponent>;

  const wallet = new Wallet('0x00', new BigNumber(1));

  beforeEach(async(() => {
    tagManagerServiceSpy = jasmine.createSpyObj('TagManagerService', [ 'sendUserId', 'sendEvent' ]);
    formBuilder = new FormBuilder();
    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    repuxLibServiceSpy.getInstance.and.returnValue({
      createFileUploader: jasmine.createSpy()
    });

    taskManagerServiceSpy = jasmine.createSpyObj('TaskManagerService', [ 'addTask' ]);
    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'addProduct', 'removeProduct' ]);
    ipfsServiceSpy = jasmine.createSpyObj('IpfsService', [ 'uploadFile' ]);
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(wallet)));
    matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', [ 'close', 'afterClosed' ]);
    transactionServiceSpy = jasmine.createSpyObj('TransactionServiceSpy', [ 'getTransactions' ]);
    transactionServiceSpy.getTransactions.and.returnValue({
      subscribe() {
      }
    });

    keyStoreDialogServiceSpy = jasmine.createSpyObj('KeyStoreDialogService', [ 'getKeys' ]);

    settingsServiceSpy = {
      daysToDeliver: environment.repux.defaultDaysToDeliver
    };

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceProductCreatorDialogComponent,
        MarketplaceProductCategorySelectorComponent,
        MarketplaceEulaSelectorComponent
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
        { provide: TagManagerService, useValue: tagManagerServiceSpy },
        { provide: MatDialogRef, useValue: matDialogRefSpy },
        { provide: RepuxLibService, useValue: repuxLibServiceSpy },
        { provide: TaskManagerService, useValue: taskManagerServiceSpy },
        { provide: IpfsService, useValue: ipfsServiceSpy },
        { provide: TransactionService, useValue: transactionServiceSpy },
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: KeyStoreDialogService, useValue: keyStoreDialogServiceSpy }
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
        tagManagerServiceSpy,
        formBuilder,
        repuxLibServiceSpy,
        taskManagerServiceSpy,
        unpublishedProductsServiceSpy,
        ipfsServiceSpy,
        walletServiceSpy,
        settingsServiceSpy,
        keyStoreDialogServiceSpy,
        matDialogRefSpy,
        transactionServiceSpy
      );

      expect(component.formGroup.controls[ 'title' ]).toBeDefined();
      expect(component.formGroup.controls[ 'shortDescription' ]).toBeDefined();
      expect(component.formGroup.controls[ 'fullDescription' ]).toBeDefined();
      expect(component.formGroup.controls[ 'category' ]).toBeDefined();
      expect(component.formGroup.controls[ 'price' ]).toBeDefined();
      expect(component.formGroup.controls[ 'file' ]).toBeDefined();
      expect(component.formGroup.controls[ 'sampleFile' ]).toBeDefined();
      expect(component.formGroup.controls[ 'eula' ]).toBeDefined();
    });
  });

  describe('#upload', () => {
    it('shouldn\'t do anything when form is invalid', async () => {
      component.formGroup = <any> {
        valid: false
      };

      await component.upload();
      expect(repuxLibServiceSpy.getInstance.calls.count()).toBe(0);
    });

    it('should add new FileUploadTask to taskManagerService', async () => {
      const title = 'TITLE';
      const shortDescription = 'SHORT_DESCRIPTION';
      const fullDescription = 'FULL_DESCRIPTION';
      const price = '12.23';
      const publicKey = 'PUBLIC_KEY';
      const file = 'FILE';

      keyStoreDialogServiceSpy.getKeys.and.returnValue(Promise.resolve({ publicKey }));

      component.wallet = wallet;
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
      expect(taskManagerServiceSpy.addTask.calls.count()).toBe(1);
      expect(keyStoreDialogServiceSpy.getKeys.calls.count()).toBe(1);
      expect(matDialogRefSpy.close.calls.count()).toBe(1);
    });
  });
});
