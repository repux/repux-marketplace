import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { BuyProductButtonComponent } from './buy-product-button.component';
import { Component, Input } from '@angular/core';
import { RepuxLibService } from '../services/repux-lib.service';
import { MatDialogModule } from '@angular/material';
import Wallet from '../wallet';
import { from } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { KeyStoreService } from '../key-store/key-store.service';

@Component({ selector: 'app-download-product-button', template: '' })
class DownloadProductButtonStubComponent {
  @Input() productAddress: string;
}

describe('BuyProductButtonComponent', () => {
  let component: BuyProductButtonComponent;
  let fixture: ComponentFixture<BuyProductButtonComponent>;
  let repuxLibServiceSpy, keyStoreServiceSpy;
  const productAddress = '0x1111111111111111111111111111111111111111';

  beforeEach(fakeAsync(() => {
    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance', 'getClass' ]);
    keyStoreServiceSpy = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys' ]);
    TestBed.configureTestingModule({
      declarations: [
        BuyProductButtonComponent,
        DownloadProductButtonStubComponent
      ],
      imports: [
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: RepuxLibService, useValue: repuxLibServiceSpy },
        { provide: KeyStoreService, useValue: keyStoreServiceSpy },
        { provide: TransactionDialogComponent, useValue: {} }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BuyProductButtonComponent);
    component = fixture.componentInstance;

    component.productAddress = productAddress;
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

  describe('#getBoughtProducts()', () => {
    it('should assign result of dataProductService.getBoughtDataProducts to boughtProducts property', async () => {
      const expectedResult = [ 'PRODUCT' ];
      const getBoughtDataProducts = jasmine.createSpy();
      getBoughtDataProducts.and.returnValue(Promise.resolve(expectedResult));
      component[ '_dataProductService' ].getBoughtDataProducts = getBoughtDataProducts;

      await component.getBoughtProducts();
      expect(component.boughtProducts).toBe(expectedResult);
      expect(getBoughtDataProducts.calls.count()).toBe(1);
    });
  });

  describe('#getApprovedProducts()', () => {
    it('should assign result of dataProductService.getBoughtAndApprovedDataProducts to approvedProducts property', async () => {
      const expectedResult = [ 'PRODUCT' ];
      const getBoughtAndApprovedDataProducts = jasmine.createSpy();
      getBoughtAndApprovedDataProducts.and.returnValue(Promise.resolve(expectedResult));
      component[ '_dataProductService' ].getBoughtAndApprovedDataProducts = getBoughtAndApprovedDataProducts;

      await component.getApprovedProducts();
      expect(component.approvedProducts).toBe(expectedResult);
      expect(getBoughtAndApprovedDataProducts.calls.count()).toBe(1);
    });
  });

  describe('#_onWalletChange()', () => {
    it('should call getBoughtProducts and getApprovedProducts', () => {
      const getApprovedProducts = jasmine.createSpy();
      const getBoughtProducts = jasmine.createSpy();
      component.getApprovedProducts = getApprovedProducts;
      component.getBoughtProducts = getBoughtProducts;
      const wallet = new Wallet('0x00', 0);
      component[ '_onWalletChange' ](wallet);
      component[ '_onWalletChange' ](wallet);
      component[ '_onWalletChange' ](null);
      component[ '_onWalletChange' ](new Wallet('0x01', 0));
      expect(getApprovedProducts.calls.count()).toBe(2);
      expect(getBoughtProducts.calls.count()).toBe(2);
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
      repuxLibServiceSpy.getClass.and.returnValue({
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
      expect(component.boughtProducts).toEqual([ productAddress ]);
      expect(component.approvedProducts).toEqual([]);
    });
  });

  describe('#get approved()', () => {
    it('should return true if approvedProducts contains productAddress', () => {
      component.approvedProducts = null;
      expect(component.approved).toBeFalsy();

      component.approvedProducts = [];
      expect(component.approved).toBeFalsy();

      component.approvedProducts = [ productAddress ];
      expect(component.approved).toBeTruthy();
    });
  });

  describe('#get bought()', () => {
    it('should return true if boughtProducts contains productAddress', () => {
      component.boughtProducts = null;
      expect(component.bought).toBeFalsy();

      component.boughtProducts = [];
      expect(component.bought).toBeFalsy();

      component.boughtProducts = [ productAddress ];
      expect(component.bought).toBeTruthy();
    });
  });

  describe('#get userIsOwner()', () => {
    it('should return true if productOwnerAddress is equal to wallet.address', () => {
      component.wallet = null;
      expect(component.userIsOwner).toBeFalsy();

      component.wallet = new Wallet('0x00', 0);
      expect(component.userIsOwner).toBeFalsy();

      component.productOwnerAddress = '0x00';
      expect(component.userIsOwner).toBeTruthy();

      component.productOwnerAddress = '0x01';
      expect(component.userIsOwner).toBeFalsy();
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
