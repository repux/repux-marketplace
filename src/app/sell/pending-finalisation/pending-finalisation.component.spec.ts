import { MatDialog, MatDialogModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { PendingFinalisationComponent } from './pending-finalisation.component';
import Wallet from '../../wallet';
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() staticQuery: {};
  @Input() displayedColumns: string[];
  @Input() availableActions: string[];
  @Input() displayPendingTransactions: boolean;
}

describe('PendingFinalisationComponent', () => {
  let component: PendingFinalisationComponent;
  let fixture: ComponentFixture<PendingFinalisationComponent>;
  let matDialog;
  const ownerAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        PendingFinalisationComponent,
        DataProductListStubComponent
      ],
      imports: [
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialog, useValue: matDialog }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PendingFinalisationComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#_onWalletChange()', () => {
    it('should set wallet and staticQuery', () => {
      expect((<any> component.staticQuery).bool.must[ 0 ].match.ownerAddress).toBe('');
      const wallet = new Wallet(ownerAddress, 0);
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](wallet);
      expect(component[ '_wallet' ]).toBe(wallet);
      component[ '_onWalletChange' ](null);
      expect(component[ '_wallet' ]).toBe(wallet);
      const wallet2 = new Wallet(ownerAddress, 0);
      component[ '_onWalletChange' ](wallet2);
      expect(component[ '_wallet' ]).toBe(wallet2);
      expect((<any> component.staticQuery).bool.must[ 0 ].match.ownerAddress).toBe(ownerAddress);
    });
  });

  describe('#DOM', () => {
    it('should render all elements', () => {
      const element: HTMLElement = fixture.nativeElement;

      expect(element.querySelector('app-data-product-list')).not.toBeNull();
    });
  });
});