import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MarketplaceBuyProductButtonComponent } from './marketplace-buy-product-button.component';
import { Component, Input } from '@angular/core';
import { RepuxLibService } from '../../services/repux-lib.service';
import Wallet from '../../shared/models/wallet';
import { from } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { KeyStoreService } from '../../key-store/key-store.service';
import { MaterialModule } from '../../material.module';
import { AwaitingFinalisationService } from '../services/awaiting-finalisation.service';
import { DataProductService } from '../../services/data-product.service';
import { TagManagerService } from '../../shared/services/tag-manager.service';
import { DataProduct } from '../../shared/models/data-product';

@Component({ selector: 'app-marketplace-download-product-button', template: '' })
class DownloadProductButtonStubComponent {
  @Input() dataProduct: DataProduct;
}

describe('MarketplaceBuyProductButtonComponent', () => {
  let component: MarketplaceBuyProductButtonComponent;
  let fixture: ComponentFixture<MarketplaceBuyProductButtonComponent>;
  let repuxLibServiceSpy, keyStoreServiceSpy, awaitingFinalisationServiceSpy, dataProductServiceSpy, tagManager;
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(fakeAsync(() => {
    tagManager = jasmine.createSpyObj('TagManagerService', [ 'sendEvent' ]);
    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    keyStoreServiceSpy = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys' ]);
    awaitingFinalisationServiceSpy = jasmine.createSpyObj('AwaitingFinalisationService', [ 'addProduct' ]);
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'purchaseDataProduct' ]);
    TestBed.configureTestingModule({
      declarations: [
        MarketplaceBuyProductButtonComponent,
        DownloadProductButtonStubComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TagManagerService, useValue: tagManager },
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: RepuxLibService, useValue: repuxLibServiceSpy },
        { provide: KeyStoreService, useValue: keyStoreServiceSpy },
        { provide: AwaitingFinalisationService, useValue: awaitingFinalisationServiceSpy },
        { provide: TransactionDialogComponent, useValue: {} }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceBuyProductButtonComponent);
    component = fixture.componentInstance;

    component.dataProductAddress = dataProductAddress;
    component.dataProduct = <any> {
      address: dataProductAddress,
      transactions: [ {
        buyerAddress,
        finalised: true
      } ]
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
    it('should call getUserIsOwner', () => {
      const getUserIsOwner = jasmine.createSpy();
      component.getUserIsOwner = getUserIsOwner;
      const wallet = new Wallet('0x00', 0);
      component[ '_onWalletChange' ](wallet);
      component[ '_onWalletChange' ](wallet);
      component[ '_onWalletChange' ](null);
      component[ '_onWalletChange' ](new Wallet('0x01', 0));
      expect(getUserIsOwner.calls.count()).toBe(2);
    });
  });

  describe('#buyDataProduct()', () => {
    it('should create transaction dialog with _dataProductService.purchaseDataProduct as a transaction', async () => {
      const expectedResult = 'RESULT';
      const keyPair = {
        privateKey: 'PRIVATE_KEY',
        publicKey: 'PUBLIC_KEY'
      };
      const getKeys = jasmine.createSpy();
      getKeys.and.returnValue(Promise.resolve(keyPair));
      component[ '_getKeys' ] = getKeys;
      const serializePublicKey = jasmine.createSpy();
      serializePublicKey.and.callFake(key => 'SERIALIZED_' + key);
      repuxLibServiceSpy.getInstance.and.returnValue({
        serializePublicKey
      });
      const callTransaction = jasmine.createSpy();
      const dialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
      dialog.open.and.returnValue({
        afterClosed() {
          return {
            subscribe(callback) {
              callback(expectedResult);
            }
          };
        },
        componentInstance: {
          callTransaction
        }
      });
      component[ '_dialog' ] = <any> dialog;

      await component.buyDataProduct();
      expect(dialog.open.calls.count()).toBe(2);
      expect(callTransaction.calls.count()).toBe(1);
      expect(component.bought).toBeTruthy();
      expect(component.finalised).toBeFalsy();
    });
  });

  describe('#get finalised()', () => {
    it('should return true if user bought product and transaction is finalised', () => {
      component.wallet = new Wallet(buyerAddress, 0);
      component.blockchainBuyTransaction = <any> {
        finalised: true,
        purchased: true
      };
      expect(component.finalised).toBeTruthy();
      component.blockchainBuyTransaction = <any> {
        finalised: false,
        purchased: true
      };
      expect(component.finalised).toBeFalsy();

      component.blockchainBuyTransaction = <any> null;
      expect(component.finalised).toBeFalsy();
    });
  });

  describe('#get bought()', () => {
    it('should return true if bought product', () => {
      component.wallet = new Wallet(buyerAddress, 0);
      component.blockchainBuyTransaction = <any> {
        purchased: true
      };
      expect(component.bought).toBeTruthy();

      component.blockchainBuyTransaction = <any> null;
      expect(component.bought).toBeFalsy();
    });
  });

  describe('#getUserIsOwner()', () => {
    it('should return true if productOwnerAddress is equal to wallet.address', () => {
      component.wallet = null;
      expect(component.getUserIsOwner()).toBeFalsy();

      component.wallet = new Wallet('0x00', 0);
      expect(component.getUserIsOwner()).toBeFalsy();

      component.productOwnerAddress = '0x00';
      expect(component.getUserIsOwner()).toBeTruthy();

      component.productOwnerAddress = '0x01';
      expect(component.getUserIsOwner()).toBeFalsy();
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
