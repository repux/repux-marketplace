import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import Wallet from '../../shared/models/wallet';
import { from } from 'rxjs';
import BigNumber from 'bignumber.js';
import { MarketplaceUnpublishButtonComponent } from './marketplace-unpublish-button.component';
import { MaterialModule } from '../../material.module';
import { DataProductService } from '../../services/data-product.service';
import { UnpublishedProductsService } from '../services/unpublished-products.service';

describe('MarketplaceUnpublishButtonComponent', () => {
  let component: MarketplaceUnpublishButtonComponent;
  let fixture: ComponentFixture<MarketplaceUnpublishButtonComponent>;
  let dataProductServiceSpy, unpublishedProductsServiceSpy;
  const ownerAddress = '0x0000000000000000000000000000000000000000';
  const dataProductAddress = '0x1111111111111111111111111111111111111111';

  beforeEach(fakeAsync(() => {
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'disableDataProduct' ]);

    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'addProduct' ]);

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceUnpublishButtonComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TransactionDialogComponent, useValue: {} },
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceUnpublishButtonComponent);
    component = fixture.componentInstance;

    component.blockchainDataProduct = {
      disabled: false
    };

    component.dataProductAddress = dataProductAddress;
    component.dataProduct = <any> {
      address: dataProductAddress,
      fundsToWithdraw: new BigNumber(1),
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

  describe('#unpublish()', () => {
    it('should create transaction dialog', async () => {
      const expectedResult = 'RESULT';
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

      await component.unpublish();
      expect(dialog.open.calls.count()).toBe(1);
      expect(callTransaction.calls.count()).toBe(1);
      expect(component.userIsOwner).toBeFalsy();
    });
  });

  describe('#addProductToUnpublishedProducts()', () => {
    it('should add copy of dataProduct to unpublishedProductService', () => {
      const dataProduct = {
        price: new BigNumber(1),
        address: '0x00',
        blockchainState: {},
        transactions: []
      };

      component.addProductToUnpublishedProducts(<any> dataProduct);
      expect(dataProduct.price).toEqual(new BigNumber(1));
      expect(dataProduct.address).toBe('0x00');
      expect(dataProduct.blockchainState).toEqual({});
      expect(dataProduct.transactions).toEqual([]);
      expect(unpublishedProductsServiceSpy.addProduct.calls.count()).toBe(1);
      expect(unpublishedProductsServiceSpy.addProduct.calls.allArgs()[ 0 ][ 0 ]).toEqual({ price: new BigNumber(1) });
    });
  });
});
