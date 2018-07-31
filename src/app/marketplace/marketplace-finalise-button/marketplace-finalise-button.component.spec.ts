import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import Wallet from '../../shared/models/wallet';
import { from } from 'rxjs';
import { MarketplaceFinaliseButtonComponent } from './marketplace-finalise-button.component';
import BigNumber from 'bignumber.js';
import { KeyStoreService } from '../../key-store/key-store.service';
import { RepuxLibService } from '../../services/repux-lib.service';
import { TaskManagerService } from '../../services/task-manager.service';
import { DataProductService } from '../../services/data-product.service';
import { MaterialModule } from '../../material.module';
import { FileReencryptionTask } from '../../tasks/file-reencryption-task';
import { PendingFinalisationService } from '../services/pending-finalisation.service';
import { TagManagerService } from '../../shared/services/tag-manager.service';
import { WalletService } from '../../services/wallet.service';

describe('MarketplaceFinaliseButtonComponent', () => {
  let component: MarketplaceFinaliseButtonComponent;
  let fixture: ComponentFixture<MarketplaceFinaliseButtonComponent>;
  let keyStoreService, matDialog, repuxLibService, taskManagerService,
    dataProductService, fileReencryptionTask, pendingFinalisationService, tagManager, walletServiceSpy;
  const ownerAddress = '0x0000000000000000000000000000000000000000';
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x2222222222222222222222222222222222222222';
  const sellerAddress = '0x33';
  const buyerPublicKey = 'PUBLIC_KEY';
  const sellerMetaHash = 'META_HASH';

  beforeEach(fakeAsync(() => {
    tagManager = jasmine.createSpyObj('TagManagerService', [ 'sendEvent' ]);
    keyStoreService = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys' ]);
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    repuxLibService = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'addTask' ]);
    dataProductService = jasmine.createSpyObj('DataProductService', [ 'finaliseDataProductPurchase' ]);
    pendingFinalisationService = jasmine.createSpyObj('PendingFinalisationService', [ 'getEntries' ]);
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);

    fileReencryptionTask = jasmine.createSpy().and.callFake(() => {
      return {
        onFinish() {
          return {
            subscribe(callback) {
              setTimeout(() => callback(true), 100);

              return {
                unsubscribe: jasmine.createSpy()
              };
            }
          };
        }
      };
    });

    repuxLibService.getInstance.and.returnValue({
      deserializePublicKey(key) {
        return 'DESERIALIZED_' + key;
      },
      createFileReencryptor() {
      }
    });

    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(new Wallet(sellerAddress, 1))));

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceFinaliseButtonComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TagManagerService, useValue: tagManager },
        { provide: TransactionDialogComponent, useValue: {} },
        { provide: KeyStoreService, useValue: keyStoreService },
        { provide: MatDialog, useValue: matDialog },
        { provide: RepuxLibService, useValue: repuxLibService },
        { provide: TaskManagerService, useValue: taskManagerService },
        { provide: DataProductService, useValue: dataProductService },
        { provide: FileReencryptionTask, useValue: fileReencryptionTask },
        { provide: PendingFinalisationService, useValue: pendingFinalisationService },
        { provide: WalletService, useValue: walletServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceFinaliseButtonComponent);
    component = fixture.componentInstance;
    component.FileReencryptionTaskClass = fileReencryptionTask;

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
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 0 ]).toBe(sellerAddress);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 1 ]).toBe(dataProductAddress);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 2 ]).toBe(buyerAddress);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 3 ]).toBe(sellerMetaHash);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 4 ]).toBe(privateKey);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 5 ]).toBe('DESERIALIZED_' + buyerPublicKey);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 6 ]).toEqual(repuxLibService);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 7 ]).toEqual(dataProductService);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 8 ]).toEqual(keyStoreService);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 9 ]).toEqual(pendingFinalisationService);
      expect(fileReencryptionTask.calls.allArgs()[ 0 ][ 10 ]).toEqual(matDialog);
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
