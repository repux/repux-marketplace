import { MatTableDataSource } from '@angular/material';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { DataProductTransaction } from '../../shared/models/data-product-transaction';
import { DataProduct } from '../../shared/models/data-product';
import { MarketplaceDataProductTransactionsListComponent } from './marketplace-data-product-transactions-list.component';
import BigNumber from 'bignumber.js';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material.module';

@Component({ selector: 'app-marketplace-finalise-button', template: '' })
class FinaliseButtonStubComponent {
  @Input() transaction: DataProductTransaction;
  @Input() dataProduct: DataProduct;
}

describe('MarketplaceDataProductTransactionsListComponent', () => {
  let component: MarketplaceDataProductTransactionsListComponent;
  let fixture: ComponentFixture<MarketplaceDataProductTransactionsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MarketplaceDataProductTransactionsListComponent,
        FinaliseButtonStubComponent
      ],
      imports: [
        SharedModule,
        MaterialModule,
        NoopAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceDataProductTransactionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#ngOnChanges()', () => {
    it('should assign to dataSource MatTableDataSource created from transactions array', () => {
      const transactions = <any> [ {
        buyerAddress: '0x11',
        finalised: false
      } ];

      component.transactions = transactions;
      component.ngOnChanges();

      expect(component.dataSource.data).toEqual(transactions);
    });
  });

  describe('#getTransactionDate()', () => {
    it('should subtract daysToDeliver from deliveryDeadline date and return as a new date', () => {
      const transaction = <any> {
        deliveryDeadline: new Date(1529937455000)
      };

      component.dataProduct = <any> {
        daysToDeliver: 2
      };

      expect(component.getTransactionDate(transaction)).toEqual(new Date(1529764655000));
    });
  });

  describe('#DOM()', () => {
    it('should display table with data provided by dataSource property', () => {
      component.transactions = <any> [ {
        buyerAddress: '0x00',
        price: new BigNumber(1.1),
        deliveryDeadline: new Date(1529937455000),
        finalised: false
      } ];
      component.dataProduct = <any> {
        daysToDeliver: 2
      };
      component.dataSource = new MatTableDataSource(component.transactions);
      fixture.detectChanges();

      const element: HTMLElement = fixture.nativeElement;
      const table = element.querySelector('mat-table');

      expect(table).toBeDefined();
      expect(table.getAttribute('matsort')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(1)').textContent.trim()).toBe('Buyer address');
      expect(table.querySelector('mat-header-cell:nth-child(1)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(2)').textContent.trim()).toBe('List price');
      expect(table.querySelector('mat-header-cell:nth-child(2)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(3)').textContent.trim()).toBe('Date');
      expect(table.querySelector('mat-header-cell:nth-child(3)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(4)').textContent.trim()).toBe('Delivery deadline');
      expect(table.querySelector('mat-header-cell:nth-child(4)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(5)').textContent.trim()).toBe('');
      expect(table.querySelector('mat-header-cell:nth-child(5)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelectorAll('[mat-row]').length).toBe(1);

      const firstRow = table.querySelector('[mat-row]');
      expect(firstRow.querySelector('mat-cell:nth-child(1)').textContent.trim()).toBe('0x00');
      expect(firstRow.querySelector('mat-cell:nth-child(2)').textContent.trim()).toBe('REPUX 1.1');
      expect(firstRow.querySelector('mat-cell:nth-child(3)').textContent.trim()).not.toBeNull();
      expect(firstRow.querySelector('mat-cell:nth-child(4)').textContent.trim()).not.toBeNull();
      expect(firstRow.querySelector('mat-cell:nth-child(5) app-marketplace-finalise-button')).not.toBeNull();
    });
  });
});
