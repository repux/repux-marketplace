import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MarketplaceBuyProductButtonComponent } from './marketplace-buy-product-button.component';
import { Component, Input } from '@angular/core';
import { RepuxLibService } from '../../services/repux-lib.service';
import Wallet from '../../shared/models/wallet';
import { from } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';
import { AwaitingFinalisationService } from '../services/awaiting-finalisation.service';
import { DataProductService } from '../../services/data-product.service';
import { TagManagerService } from '../../shared/services/tag-manager.service';
import { DataProduct } from '../../shared/models/data-product';
import BigNumber from 'bignumber.js';
import { CommonDialogService } from '../../shared/services/common-dialog.service';
import {
  MarketplaceBeforeBuyConfirmationDialogComponent
} from '../marketplace-before-buy-confirmation-dialog/marketplace-before-buy-confirmation-dialog.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { CurrencyRepuxPipe } from '../../shared/pipes/currency-repux.pipe';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { ArrayJoinPipe } from '../../shared/pipes/array-join.pipe';
import { TransactionStatus, TransactionReceipt } from 'repux-web3-api';
import { KeyStoreDialogService } from '../../key-store/key-store-dialog.service';

@Component({ selector: 'app-marketplace-download-product-button', template: '' })
class DownloadProductButtonStubComponent {
  @Input() dataProduct: DataProduct;
}

describe('MarketplaceBuyProductButtonComponent', () => {
  let component: MarketplaceBuyProductButtonComponent;
  let fixture: ComponentFixture<MarketplaceBuyProductButtonComponent>;
  let repuxLibServiceSpy, awaitingFinalisationServiceSpy, dataProductServiceSpy, tagManager, commonDialogServiceSpy,
    keyStoreDialogServiceSpy;
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const buyerAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(fakeAsync(() => {
    tagManager = jasmine.createSpyObj('TagManagerService', [ 'sendEvent' ]);
    repuxLibServiceSpy = jasmine.createSpyObj('RepuxLibService', [ 'getInstance' ]);
    awaitingFinalisationServiceSpy = jasmine.createSpyObj('AwaitingFinalisationService', [ 'addProduct' ]);
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService',
      [ 'purchaseDataProduct', 'approveTokensTransferForDataProductPurchase' ]);
    commonDialogServiceSpy = jasmine.createSpyObj('CommonDialogService', [ 'transaction' ]);
    commonDialogServiceSpy.transaction.and.callFake(methodToCall => methodToCall());

    keyStoreDialogServiceSpy = jasmine.createSpyObj('KeyStoreDialogService', [ 'getKeys' ]);

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceBuyProductButtonComponent,
        DownloadProductButtonStubComponent,
        MarketplaceBeforeBuyConfirmationDialogComponent,
        CurrencyRepuxPipe,
        FileSizePipe,
        ArrayJoinPipe
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TagManagerService, useValue: tagManager },
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: RepuxLibService, useValue: repuxLibServiceSpy },
        { provide: AwaitingFinalisationService, useValue: awaitingFinalisationServiceSpy },
        { provide: CommonDialogService, useValue: commonDialogServiceSpy },
        { provide: KeyStoreDialogService, useValue: keyStoreDialogServiceSpy }
      ]
    })
      .compileComponents();

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          MarketplaceBeforeBuyConfirmationDialogComponent
        ]
      }
    });

    fixture = TestBed.createComponent(MarketplaceBuyProductButtonComponent);
    component = fixture.componentInstance;

    component.dataProductAddress = dataProductAddress;
    component.dataProduct = <any> {
      address: dataProductAddress,
      price: new BigNumber(1),
      title: 'TITLE',
      ownerAddress: '0x01',
      category: [ 'CATEGORY' ],
      orders: [ {
        buyerAddress,
        finalised: true
      } ]
    };
    fixture.detectChanges();
  }));

  describe('#ngOnInit()', () => {
    it('should call onWalletChange', async () => {
      const wallet = new Wallet('0x00', 0);
      const getWallet = jasmine.createSpy();
      getWallet.and.returnValue(from(Promise.resolve(wallet)));
      const onWalletChange = jasmine.createSpy();
      component[ 'onWalletChange' ] = onWalletChange;
      component[ 'walletService' ] = <any> {
        getWallet
      };

      await component.ngOnInit();
      expect(onWalletChange.calls.count()).toBe(1);
      expect(onWalletChange.calls.allArgs()[ 0 ][ 0 ]).toBe(wallet);
    });
  });

  describe('#onWalletChange()', () => {
    it('should call getUserIsOwner', () => {
      const getUserIsOwner = jasmine.createSpy();
      component.getUserIsOwner = getUserIsOwner;
      const wallet = new Wallet('0x00', 0);
      component[ 'onWalletChange' ](wallet);
      component[ 'onWalletChange' ](wallet);
      component[ 'onWalletChange' ](null);
      component[ 'onWalletChange' ](new Wallet('0x01', 0));
      expect(getUserIsOwner.calls.count()).toBe(2);
    });
  });

  describe('#buyDataProduct()', () => {
    it('should open confirmation dialog', () => {
      const dialogRef = component.buyDataProduct();

      expect(dialogRef.componentInstance.dataProduct).toEqual(component.dataProduct);
    });
  });

  describe('#sendTransaction()', () => {
    it('should call dataProductService.approveTokensTransferForDataProductPurchase using commonDialogService.transaction', () => {
      component.sendTransaction();

      expect(dataProductServiceSpy.approveTokensTransferForDataProductPurchase.calls.count()).toBe(1);
      expect(dataProductServiceSpy.approveTokensTransferForDataProductPurchase.calls.allArgs()[ 0 ]).toEqual([ dataProductAddress ]);
    });
  });

  describe('#onApproveTransactionFinish()', () => {
    it('should call dataProductService.purchaseDataProduct using commonDialogService.transaction', async () => {
      keyStoreDialogServiceSpy.getKeys.and.returnValue(Promise.resolve({ publicKey: 'PUBLIC_KEY' }));

      const serializePublicKey = jasmine.createSpy();
      serializePublicKey.and.callFake(key => 'SERIALIZED_' + key);
      repuxLibServiceSpy.getInstance.and.returnValue({
        serializePublicKey
      });

      await component.onApproveTransactionFinish({ status: TransactionStatus.SUCCESSFUL } as TransactionReceipt);

      expect(dataProductServiceSpy.purchaseDataProduct.calls.count()).toBe(1);
      expect(dataProductServiceSpy.purchaseDataProduct.calls.allArgs()[ 0 ]).toEqual([ dataProductAddress, 'SERIALIZED_PUBLIC_KEY' ]);
    });
  });

  describe('#get finalised()', () => {
    it('should return true if user bought product and order is finalised', () => {
      component.wallet = new Wallet(buyerAddress, 0);
      component.blockchainDataProductOrder = <any> {
        finalised: true,
        purchased: true
      };
      expect(component.finalised).toBeTruthy();
      component.blockchainDataProductOrder = <any> {
        finalised: false,
        purchased: true
      };
      expect(component.finalised).toBeFalsy();

      component.blockchainDataProductOrder = <any> null;
      expect(component.finalised).toBeFalsy();
    });
  });

  describe('#get bought()', () => {
    it('should return true if bought product', () => {
      component.wallet = new Wallet(buyerAddress, 0);
      component.blockchainDataProductOrder = <any> {
        purchased: true
      };
      expect(component.bought).toBeTruthy();

      component.blockchainDataProductOrder = <any> null;
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
});
