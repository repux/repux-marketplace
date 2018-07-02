import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import Wallet from '../shared/models/wallet';
import { from } from 'rxjs';
import { WithdrawButtonComponent } from './withdraw-button.component';
import BigNumber from 'bignumber.js';

describe('WithdrawButtonComponent', () => {
  let component: WithdrawButtonComponent;
  let fixture: ComponentFixture<WithdrawButtonComponent>;
  const ownerAddress = '0x0000000000000000000000000000000000000000';
  const dataProductAddress = '0x1111111111111111111111111111111111111111';

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        WithdrawButtonComponent
      ],
      imports: [
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TransactionDialogComponent, useValue: {} }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WithdrawButtonComponent);
    component = fixture.componentInstance;

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

  describe('#withdraw()', () => {
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

      await component.withdraw();
      expect(dialog.open.calls.count()).toBe(1);
      expect(callTransaction.calls.count()).toBe(1);
      expect(component.dataProduct.fundsToWithdraw).toEqual(new BigNumber(0));
    });
  });
});
