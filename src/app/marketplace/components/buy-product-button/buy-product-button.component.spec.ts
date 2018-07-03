import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { BuyProductButtonComponent } from './buy-product-button.component';
import { Component, Input } from '@angular/core';
import { RepuxLibService } from '../../../services/repux-lib.service';
import Wallet from '../../../shared/models/wallet';
import { from } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TransactionDialogComponent } from '../../../shared/components/transaction-dialog/transaction-dialog.component';
import { KeyStoreService } from '../../../key-store/key-store.service';
import { MaterialModule } from '../../../material.module';

@Component({ selector: 'app-download-product-button', template: '' })
class DownloadProductButtonStubComponent {
  @Input() productAddress: string;
}

describe('BuyProductButtonComponent', () => {
  let component: BuyProductButtonComponent;
  let fixture: ComponentFixture<BuyProductButtonComponent>;
  let repuxLibServiceSpy, keyStoreServiceSpy;
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(fakeAsync(() => {
    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance', 'getClass' ]);
    keyStoreServiceSpy = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys' ]);
    TestBed.configureTestingModule({
      declarations: [
        BuyProductButtonComponent,
        DownloadProductButtonStubComponent
      ],
      imports: [
        MaterialModule,
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
    it('should call getBoughtProducts and getFinalisedProducts', () => {
      const getFinalised = jasmine.createSpy();
      const getBought = jasmine.createSpy();
      const getUserIsOwner = jasmine.createSpy();
      component.getFinalised = getFinalised;
      component.getBought = getBought;
      component.getUserIsOwner = getUserIsOwner;
      const wallet = new Wallet('0x00', 0);
      component[ '_onWalletChange' ](wallet);
      component[ '_onWalletChange' ](wallet);
      component[ '_onWalletChange' ](null);
      component[ '_onWalletChange' ](new Wallet('0x01', 0));
      expect(getFinalised.calls.count()).toBe(2);
      expect(getBought.calls.count()).toBe(2);
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
      expect(component.bought).toBeTruthy();
      expect(component.finalised).toBeFalsy();
    });
  });

  describe('#getFinalised()', () => {
    it('should return true if user bought product and transaction is finalised', () => {
      component.wallet = new Wallet(buyerAddress, 0);
      component.dataProduct = <any> {
        address: dataProductAddress,
        transactions: [ {
          buyerAddress,
          finalised: true
        } ]
      };
      expect(component.getFinalised()).toBeTruthy();
      component.dataProduct = <any> {
        address: dataProductAddress,
        transactions: [ {
          buyerAddress: '0x00',
          finalised: true
        } ]
      };
      expect(component.getFinalised()).toBeFalsy();

      component.dataProduct = <any> {
        address: dataProductAddress,
        transactions: []
      };
      expect(component.getFinalised()).toBeFalsy();

      component.dataProduct = <any> {
        address: dataProductAddress,
        transactions: [ {
          buyerAddress,
          finalised: false
        } ]
      };
      expect(component.getFinalised()).toBeFalsy();
    });
  });

  describe('#getBought()', () => {
    it('should return true if bought product', () => {
      component.wallet = new Wallet(buyerAddress, 0);
      component.dataProduct = <any> {
        address: dataProductAddress,
        transactions: [ {
          buyerAddress
        } ]
      };
      expect(component.getBought()).toBeTruthy();

      component.dataProduct = <any> {
        address: dataProductAddress,
        transactions: [ {
          buyerAddress: '0x00'
        } ]
      };
      expect(component.getBought()).toBeFalsy();
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
