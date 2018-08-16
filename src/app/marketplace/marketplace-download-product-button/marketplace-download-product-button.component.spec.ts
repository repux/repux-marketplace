import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { RepuxLibService } from '../../services/repux-lib.service';
import { MarketplaceDownloadProductButtonComponent } from './marketplace-download-product-button.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import Wallet from '../../shared/models/wallet';
import { from } from 'rxjs';
import { KeyStoreService } from '../../key-store/key-store.service';
import { MaterialModule } from '../../material.module';
import { DataProductService } from '../../services/data-product.service';
import { TagManagerService } from '../../shared/services/tag-manager.service';

describe('MarketplaceDownloadProductButtonComponent', () => {
  let component: MarketplaceDownloadProductButtonComponent;
  let fixture: ComponentFixture<MarketplaceDownloadProductButtonComponent>;
  let repuxLibServiceSpy, keyStoreServiceSpy, dataProductServiceSpy, tagManagerSpy;
  const productAddress = '0x1111111111111111111111111111111111111111';

  beforeEach(fakeAsync(() => {
    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    repuxLibServiceSpy.getInstance.and.returnValue({
      createFileDownloader: jasmine.createSpy()
    });
    keyStoreServiceSpy = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys' ]);
    tagManagerSpy = jasmine.createSpyObj('TagManagerService', [ 'sendEvent' ]);
    dataProductServiceSpy = jasmine.createSpyObj('DataProductServiceSpy', [ 'getDataProductData', 'getOrderData' ]);
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
        { provide: KeyStoreService, useValue: keyStoreServiceSpy }
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
      const wallet = new Wallet('0x00', 0);
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
      const wallet = new Wallet('0x00', 0);
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](null);
      expect(component[ '_wallet' ]).toBe(wallet);
      const wallet2 = new Wallet('0x01', 0);
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
      const getKeys = jasmine.createSpy();
      getKeys.and.returnValue(Promise.resolve(keyPair));
      component[ '_getKeys' ] = getKeys;
      dataProductServiceSpy.getDataProductData.and.returnValue(Promise.resolve({
        owner: '0x00'
      }));
      component[ '_wallet' ] = new Wallet('0x01', 0);
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
      const getKeys = jasmine.createSpy();
      getKeys.and.returnValue(Promise.resolve(keyPair));
      component[ '_getKeys' ] = getKeys;
      dataProductServiceSpy.getDataProductData.and.returnValue(Promise.resolve({
        owner: '0x00',
        sellerMetaHash
      }));
      component[ '_wallet' ] = new Wallet('0x00', 0);
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

  describe('#_getKeys()', () => {
    it('should open KeysPasswordDialogComponent when keyStoreService.hasKeys return true', async () => {
      const expectedResult = {
        publicKey: 'PUBLICK_KEY',
        privateKey: 'PRIVATE_KEY'
      };
      const subscribe = jasmine.createSpy();
      subscribe.and.callFake(callback => callback(expectedResult));
      const afterClosed = jasmine.createSpy();
      afterClosed.and.returnValue({ subscribe });
      keyStoreServiceSpy.hasKeys.and.returnValue(true);
      const matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
      matDialog.open.and.returnValue({ afterClosed });
      component[ '_dialog' ] = matDialog;

      const result = await component[ '_getKeys' ]();
      expect(result).toEqual(<any> expectedResult);
    });

    it('should open KeysGeneratorDialogComponent when keyStoreService.hasKeys return true', async () => {
      const expectedResult = {
        publicKey: 'PUBLICK_KEY',
        privateKey: 'PRIVATE_KEY'
      };
      const subscribe = jasmine.createSpy();
      subscribe.and.callFake(callback => callback(expectedResult));
      const afterClosed = jasmine.createSpy();
      afterClosed.and.returnValue({ subscribe });
      keyStoreServiceSpy.hasKeys.and.returnValue(false);
      const matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
      matDialog.open.and.returnValue({ afterClosed });
      component[ '_dialog' ] = matDialog;

      const result = await component[ '_getKeys' ]();
      expect(result).toEqual(<any> expectedResult);
    });
  });
});
