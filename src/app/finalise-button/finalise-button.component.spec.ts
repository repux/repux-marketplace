import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import Wallet from '../wallet';
import { from } from 'rxjs';
import { FinaliseButtonComponent } from './finalise-button.component';
import BigNumber from 'bignumber.js';
import { KeyStoreService } from '../key-store/key-store.service';
import { DataProductNotificationsService } from '../services/data-product-notifications.service';
import { RepuxLibService } from '../services/repux-lib.service';
import { TaskManagerService } from '../services/task-manager.service';
import { DataProductService } from '../services/data-product.service';

describe('FinaliseButtonComponent', () => {
  let component: FinaliseButtonComponent;
  let fixture: ComponentFixture<FinaliseButtonComponent>;
  let keyStoreService, matDialog, dataProductNotificationsService, repuxLibService, taskManagerService,
    dataProductService;
  const ownerAddress = '0x0000000000000000000000000000000000000000';
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x2222222222222222222222222222222222222222';
  const buyerPublicKey = 'PUBLIC_KEY';
  const sellerMetaHash = 'META_HASH';

  beforeEach(fakeAsync(() => {
    keyStoreService = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys' ]);
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    dataProductNotificationsService = jasmine.createSpyObj('DataProductNotificationsService', [ 'removeFinalisationRequest' ]);
    repuxLibService = jasmine.createSpyObj('RepuxLibService', [ 'getClass', 'getInstance' ]);
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'addTask' ]);
    dataProductService = jasmine.createSpyObj('DataProductService', [ 'finaliseDataProductPurchase' ]);

    repuxLibService.getClass.and.returnValue({
      deserializePublicKey(key) {
        return 'DESIERIALIZED_' + key;
      }
    });
    repuxLibService.getInstance.and.returnValue({
      createFileReencryptor() {
      }
    });

    TestBed.configureTestingModule({
      declarations: [
        FinaliseButtonComponent
      ],
      imports: [
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TransactionDialogComponent, useValue: {} },
        { provide: KeyStoreService, useValue: keyStoreService },
        { provide: MatDialog, useValue: matDialog },
        { provide: DataProductNotificationsService, useValue: dataProductNotificationsService },
        { provide: RepuxLibService, useValue: repuxLibService },
        { provide: TaskManagerService, useValue: taskManagerService },
        { provide: DataProductService, useValue: dataProductService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FinaliseButtonComponent);
    component = fixture.componentInstance;

    component.transaction = <any> {
      buyerAddress,
      publicKey: buyerPublicKey,
      finalised: false,
      buyerPublicKey
    };
    component.dataProduct = <any> {
      address: dataProductAddress,
      fundsToWithdraw: new BigNumber(1),
      sellerMetaHash,
      ownerAddress,
      transactions: []
    };
    fixture.detectChanges();
  }));

  describe('#ngOnInit()', () => {
    it('should call _onWalletChange', async () => {
      const wallet = new Wallet(ownerAddress, 0);
      const getWallet = jasmine.createSpy();
      getWallet.and.returnValue(from(Promise.resolve(wallet)));
      const onWalletChange = jasmine.createSpy();
      component[ '_onWalletChange' ] = onWalletChange;
      component[ '_walletService' ] = <any> {
        getWallet
      };

      await component.ngOnInit();
      expect(onWalletChange.calls.count()).toBe(1);
      expect(onWalletChange.calls.allArgs()[ 0 ][ 0 ]).toBe(wallet);
    });
  });

  describe('#_onWalletChange()', () => {
    it('should set wallet', () => {
      const wallet = new Wallet(ownerAddress, 0);
      component[ '_onWalletChange' ](wallet);
      expect(component[ 'wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](wallet);
      expect(component[ 'wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](null);
      expect(component[ 'wallet' ]).toBe(wallet);
      const wallet2 = new Wallet(ownerAddress, 0);
      component[ '_onWalletChange' ](wallet2);
      expect(component[ 'wallet' ]).toBe(wallet2);
    });
  });

  describe('#finalise()', () => {
    it('should create file reencryption task', async () => {
      const privateKey = 'PRIVATE_KEY';
      const getKeys = jasmine.createSpy();
      getKeys.and.returnValue(Promise.resolve({ privateKey }));
      component[ '_getKeys' ] = getKeys;

      await component.finalise();
      expect(component.transaction.finalised).toBeTruthy();
      const fileReencryptionTask = taskManagerService.addTask.calls.allArgs()[ 0 ][ 0 ];
      expect(fileReencryptionTask[ '_dataProductAddress' ]).toBe(dataProductAddress);
      expect(fileReencryptionTask[ '_buyerAddress' ]).toBe(buyerAddress);
      expect(fileReencryptionTask[ '_metaFileHash' ]).toBe(sellerMetaHash);
      expect(fileReencryptionTask[ '_sellerPrivateKey' ]).toBe(privateKey);
      expect(fileReencryptionTask[ '_buyerPublicKey' ]).toBe('DESIERIALIZED_' + buyerPublicKey);
      expect(fileReencryptionTask[ '_repuxLibService' ]).toEqual(repuxLibService);
      expect(fileReencryptionTask[ '_dataProductService' ]).toEqual(dataProductService);
      expect(fileReencryptionTask[ '_keyStoreService' ]).toEqual(keyStoreService);
      expect(fileReencryptionTask[ '_dialog' ]).toEqual(matDialog);
    });
  });

  describe('#_getKeys()', () => {
    it('should open KeysPasswordDialogComponent when keyStoreService.hasKeys return true', async () => {
      const expectedResult = {
        publicKey: 'PUBLIC_KEY',
        privateKey: 'PRIVATE_KEY'
      };
      const subscribe = jasmine.createSpy();
      subscribe.and.callFake(callback => callback(expectedResult));
      const afterClosed = jasmine.createSpy();
      afterClosed.and.returnValue({ subscribe });
      keyStoreService.hasKeys.and.returnValue(true);
      matDialog.open.and.returnValue({ afterClosed });

      const result = await component[ '_getKeys' ]();
      expect(result).toEqual(<any> expectedResult);
    });

    it('should open KeysGeneratorDialogComponent when keyStoreService.hasKeys return true', async () => {
      const expectedResult = {
        publicKey: 'PUBLIC_KEY',
        privateKey: 'PRIVATE_KEY'
      };
      const subscribe = jasmine.createSpy();
      subscribe.and.callFake(callback => callback(expectedResult));
      const afterClosed = jasmine.createSpy();
      afterClosed.and.returnValue({ subscribe });
      keyStoreService.hasKeys.and.returnValue(false);
      matDialog.open.and.returnValue({ afterClosed });

      const result = await component[ '_getKeys' ]();
      expect(result).toEqual(<any> expectedResult);
    });
  });
});
