import { MatTableDataSource, MatTableModule } from '@angular/material';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PipesModule } from '../pipes/pipes.module';
import { Component, Input } from '@angular/core';
import { DataProductTransaction } from '../data-product-transaction';
import { DataProduct } from '../data-product';
import { DataProductTransactionsListComponent } from './data-product-transactions-list.component';
import BigNumber from 'bignumber.js';

@Component({ selector: 'app-finalise-button', template: '' })
class FinaliseButtonStubComponent {
  @Input() transaction: DataProductTransaction;
  @Input() dataProduct: DataProduct;
}

describe('DataProductTransactionsListComponent', () => {
  let component: DataProductTransactionsListComponent;
  let fixture: ComponentFixture<DataProductTransactionsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataProductTransactionsListComponent,
        FinaliseButtonStubComponent
      ],
      imports: [
        MatTableModule,
        PipesModule,
        NoopAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataProductTransactionsListComponent);
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
    it('should subtract daysForDeliver from deliveryDeadline date and return as a new date', () => {
      const transaction = <any> {
        deliveryDeadline: new Date(1529937455000)
      };

      component.dataProduct = <any> {
        daysForDeliver: 2
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
        daysForDeliver: 2
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
      expect(firstRow.querySelector('mat-cell:nth-child(5) app-finalise-button')).not.toBeNull();
    });
  });
});
