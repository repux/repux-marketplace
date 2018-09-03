import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { RepuxLibService } from '../../services/repux-lib.service';
import { MarketplaceDownloadProductButtonComponent } from './marketplace-download-product-button.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import Wallet from '../../shared/models/wallet';
import { from } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { DataProductService } from '../../services/data-product.service';
import { TagManagerService } from '../../shared/services/tag-manager.service';
import { KeyStoreDialogService } from '../../key-store/key-store-dialog.service';
import { TaskManagerService } from '../../services/task-manager.service';
import BigNumber from 'bignumber.js';

describe('MarketplaceDownloadProductButtonComponent', () => {
  let component: MarketplaceDownloadProductButtonComponent;
  let fixture: ComponentFixture<MarketplaceDownloadProductButtonComponent>;
  let repuxLibServiceSpy, keyStoreDialogServiceSpy, dataProductServiceSpy, tagManagerSpy, taskManagerServiceSpy;
  const productAddress = '0x1111111111111111111111111111111111111111';

  beforeEach(fakeAsync(() => {
    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    repuxLibServiceSpy.getInstance.and.returnValue({
      createFileDownloader: jasmine.createSpy()
    });
    keyStoreDialogServiceSpy = jasmine.createSpyObj('KeyStoreDialogService', [ 'getKeys' ]);
    tagManagerSpy = jasmine.createSpyObj('TagManagerService', [ 'sendEvent' ]);
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'getDataProductData', 'getOrderData' ]);
    taskManagerServiceSpy = jasmine.createSpyObj('TaskManagerService', [ 'getTasks', 'addTask' ]);
    taskManagerServiceSpy.getTasks.and.returnValue({
      subscribe() {
      }
    });

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceDownloadProductButtonComponent,
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TagManagerService, useValue: tagManagerSpy },
        { provide: RepuxLibService, useValue: repuxLibServiceSpy },
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: KeyStoreDialogService, useValue: keyStoreDialogServiceSpy },
        { provide: TaskManagerService, useValue: taskManagerServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceDownloadProductButtonComponent);
    component = fixture.componentInstance;

    component.dataProduct = <any> {
      address: productAddress,
      orders: []
    };
    fixture.detectChanges();
  }));

  describe('#ngOnInit()', () => {
    it('should call _onWalletChange', async () => {
      const wallet = new Wallet('0x00', new BigNumber(0));
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
    it('should set _wallet', () => {
      const wallet = new Wallet('0x00', new BigNumber(0));
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](null);
      expect(component[ '_wallet' ]).toBe(wallet);
      const wallet2 = new Wallet('0x01', new BigNumber(0));
      component[ '_onWalletChange' ](wallet2);
      expect(component[ '_wallet' ]).toBe(wallet2);
    });
  });

  describe('#downloadProduct()', () => {
    it('should create FileDownloadTask when user bought file', async () => {
      const keyPair = {
        privateKey: 'PRIVATE_KEY',
        publicKey: 'PUBLIC_KEY'
      };
      const buyerMetaHash = 'SOME_HASH';
      keyStoreDialogServiceSpy.getKeys.and.returnValue(Promise.resolve(keyPair));
      dataProductServiceSpy.getDataProductData.and.returnValue(Promise.resolve({
        owner: '0x00'
      }));
      component[ '_wallet' ] = new Wallet('0x01', new BigNumber(0));
      dataProductServiceSpy.getOrderData.and.returnValue(Promise.resolve({
        buyerMetaHash
      }));
      const taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'addTask' ]);
      component[ '_taskManagerService' ] = taskManagerService;

      await component.downloadProduct();
      const fileDownloadTask = taskManagerService.addTask.calls.allArgs()[ 0 ][ 0 ];
      expect(dataProductServiceSpy.getDataProductData.calls.count()).toBe(1);
      expect(dataProductServiceSpy.getOrderData.calls.count()).toBe(1);
      expect(fileDownloadTask[ '_dataProductAddress' ]).toBe(productAddress);
      expect(fileDownloadTask[ '_buyerAddress' ]).toBe('0x01');
      expect(fileDownloadTask[ '_metaFileHash' ]).toBe(buyerMetaHash);
      expect(fileDownloadTask[ '_buyerPrivateKey' ]).toBe(keyPair.privateKey);
    });

    it('should create FileDownloadTask when user own file', async () => {
      const keyPair = {
        privateKey: 'PRIVATE_KEY',
        publicKey: 'PUBLIC_KEY'
      };
      const sellerMetaHash = 'SOME_HASH';
      keyStoreDialogServiceSpy.getKeys.and.returnValue(Promise.resolve(keyPair));
      dataProductServiceSpy.getDataProductData.and.returnValue(Promise.resolve({
        owner: '0x00',
        sellerMetaHash
      }));
      component[ '_wallet' ] = new Wallet('0x00', new BigNumber(0));
      const taskManagerService = jasmine.createSpyObj('TaskManagerService', [ 'addTask' ]);
      component[ '_taskManagerService' ] = taskManagerService;

      await component.downloadProduct();
      const fileDownloadTask = taskManagerService.addTask.calls.allArgs()[ 0 ][ 0 ];
      expect(dataProductServiceSpy.getDataProductData.calls.count()).toBe(1);
      expect(fileDownloadTask[ '_dataProductAddress' ]).toBe(productAddress);
      expect(fileDownloadTask[ '_buyerAddress' ]).toBe('0x00');
      expect(fileDownloadTask[ '_metaFileHash' ]).toBe(sellerMetaHash);
      expect(fileDownloadTask[ '_buyerPrivateKey' ]).toBe(keyPair.privateKey);
    });
  });
});
