import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { TransactionDialogComponent } from '../../shared/components/transaction-dialog/transaction-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import BigNumber from 'bignumber.js';
import { MarketplacePublishButtonComponent } from './marketplace-publish-button.component';
import { UnpublishedProductsService } from '../../services/unpublished-products.service';
import { DataProductService } from '../../services/data-product.service';
import { MaterialModule } from '../../material.module';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DataProduct } from '../../shared/models/data-product';
import { TagManagerService } from '../../shared/services/tag-manager.service';

describe('MarketplacePublishButtonComponent', () => {
  let component: MarketplacePublishButtonComponent;
  let fixture: ComponentFixture<MarketplacePublishButtonComponent>;
  let tagManagerService, unpublishedProductsServiceSpy, dataProductServiceSpy;
  const ownerAddress = '0x0000000000000000000000000000000000000000';
  const dataProductAddress = '0x1111111111111111111111111111111111111111';
  const sellerMetaHash = 'SELLER_META_HASH';

  beforeEach(fakeAsync(() => {
    tagManagerService = jasmine.createSpyObj('TagManagerService', [ 'sendUserId', 'sendEvent' ]);
    unpublishedProductsServiceSpy = jasmine.createSpyObj('UnpublishedProductsService', [ 'removeProduct', 'getProducts' ]);
    unpublishedProductsServiceSpy.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ new DataProduct() ]));
    dataProductServiceSpy = jasmine.createSpyObj('DataProductService', [ 'publishDataProduct' ]);
    TestBed.configureTestingModule({
      declarations: [
        MarketplacePublishButtonComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TagManagerService, useValue: tagManagerService },
        { provide: TransactionDialogComponent, useValue: {} },
        { provide: DataProductService, useValue: dataProductServiceSpy },
        { provide: UnpublishedProductsService, useValue: unpublishedProductsServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplacePublishButtonComponent);
    component = fixture.componentInstance;

    component.dataProductAddress = dataProductAddress;
    component.dataProduct = <any> {
      name: 'file.txt',
      address: dataProductAddress,
      fundsToWithdraw: new BigNumber(1),
      ownerAddress,
      sellerMetaHash,
      transactions: []
    };
    fixture.detectChanges();
  }));

  describe('#publish()', () => {
    it('should create transaction dialog', async () => {
      let callback;
      const expectedResult = 'RESULT';
      const callTransaction = jasmine.createSpy().and.callFake(async function () {
        await this.transaction();
        callback(expectedResult);
      });
      const dialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
      dialog.open.and.returnValue({
        afterClosed() {
          return {
            subscribe(_callback) {
              callback = _callback;
            }
          };
        },
        componentInstance: {
          callTransaction
        }
      });
      component[ '_dialog' ] = <any> dialog;

      await component.publish();
      expect(dialog.open.calls.count()).toBe(1);
      expect(callTransaction.calls.count()).toBe(1);
      expect(unpublishedProductsServiceSpy.removeProduct.calls.count()).toBe(1);
      expect(dataProductServiceSpy.publishDataProduct.calls.count()).toBe(1);
    });
  });

  describe('#remove()', () => {
    it('should create confirmation dialog', async () => {
      const componentInstance = {
        title: '',
        body: ''
      };
      const dialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
      dialog.open.and.returnValue({
        afterClosed() {
          return {
            subscribe(callback) {
              callback(true);
            }
          };
        },
        componentInstance
      });
      component[ '_dialog' ] = <any> dialog;

      await component.remove();
      expect(dialog.open.calls.count()).toBe(1);
      expect(componentInstance.title).toBe('Removing marketplace-sell-unpublished file');
      expect(componentInstance.body).toBe('Are you sure you want to delete product file.txt?');
      expect(unpublishedProductsServiceSpy.removeProduct.calls.count()).toBe(1);
    });
  });
});
