import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceDataProductListComponent } from './marketplace-data-product-list.component';
import { MatTableDataSource } from '@angular/material';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataProductListService } from '../../services/data-product-list.service';
import { from as fromPromise } from 'rxjs/index';
import { EsResponse } from '../../shared/models/es-response';
import { Deserializable } from '../../shared/models/deserializable';
import { EsDataProduct } from '../../shared/models/es-data-product';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DataProduct } from '../../shared/models/data-product';
import { MarketplaceDataProductListDetailDirective } from './marketplace-data-product-list-detail.directive';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { PendingFinalisationService } from '../services/pending-finalisation.service';

@Component({ selector: 'app-file-size', template: '{{bytes}}' })
class MarketplaceFileSizeStubComponent {
  @Input() bytes: number;
}

@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: string[];
}

@Component({ selector: 'app-marketplace-data-product-transactions-list-container', template: '' })
class DataProductTransactionsListContainerStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() displayPendingTransactions: boolean;
  @Output() finaliseSuccess = new EventEmitter<any>();
}

describe('MarketplaceDataProductListComponent', () => {
  let component: MarketplaceDataProductListComponent;
  let fixture: ComponentFixture<MarketplaceDataProductListComponent>;
  let dataProductListServiceSpy, pendingFinalisationServiceSpy;

  beforeEach(async(() => {
    pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'findTransaction' ]);
    dataProductListServiceSpy = jasmine.createSpyObj('DataProductListService', [ 'getDataProductsWithBlockchainState' ]);
    dataProductListServiceSpy.getDataProductsWithBlockchainState.and.callFake(() => {
      const response = new EsResponse();
      response.hits = [];
      return fromPromise(Promise.resolve(response));
    });

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceDataProductListComponent,
        MarketplaceFileSizeStubComponent,
        MarketplaceActionButtonsStubComponent,
        MarketplaceDataProductListDetailDirective,
        DataProductTransactionsListContainerStubComponent
      ],
      imports: [
        SharedModule,
        MaterialModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DataProductListService, useValue: dataProductListServiceSpy },
        { provide: PendingFinalisationService, useValue: pendingFinalisationServiceSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceDataProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#applyFilter()', () => {
    it('should add filterValue to query attribute and should set from attribute to 0', () => {
      component.from = 5;
      component.applyFilter('String to search for');
      expect(component.from).toBe(0);
      expect(component.query).toEqual([
        { regexp: { name: '.*"string to search for".*' } },
        { regexp: { title: '.*"string to search for".*' } },
        { regexp: { category: '.*"string to search for".*' } },
        { fuzzy: { name: 'string to search for' } },
        { fuzzy: { title: 'string to search for' } },
        { fuzzy: { category: 'string to search for' } }
      ]);
    });

    it('should call refreshData method', () => {
      const refreshData = spyOn(component, 'refreshData');
      component.applyFilter('');
      expect(refreshData.calls.count()).toBe(1, 'one call');
    });
  });

  describe('#pageChanged()', () => {
    it('should set size and from attributes basing on pageChangeEvent argument', () => {
      component.from = 0;
      component.size = 3;
      component.pageChanged({ pageSize: 10, pageIndex: 13, length: 10 });
      expect(component.size).toBe(10);
      expect(component.from).toBe(130);
    });

    it('should call refreshData method', () => {
      const refreshData = spyOn(component, 'refreshData');
      component.pageChanged({ pageSize: 10, pageIndex: 13, length: 10 });
      expect(refreshData.calls.count()).toBe(1, 'one call');
    });
  });

  describe('#sortChanged()', () => {
    it('should set sort property sort argument has active and direction properties set', () => {
      component.sort = null;
      component.sortChanged({ active: 'name', direction: 'asc' });
      expect(component.sort).toBe('name.keyword:asc');
      component.sortChanged({ active: 'price', direction: 'asc' });
      expect(component.sort).toBe('price:asc');
      component.sortChanged({ active: null, direction: 'asc' });
      expect(component.sort).toBeUndefined();
      component.sortChanged({ active: 'name', direction: '' });
      expect(component.sort).toBeUndefined();
    });

    it('should call refreshData method', () => {
      const refreshData = spyOn(component, 'refreshData');
      component.sortChanged({ active: 'name', direction: 'asc' });
      expect(refreshData.calls.count()).toBe(1, 'one call');
    });
  });

  describe('#refreshData()', () => {
    it('should call getDataProductsWithBlockchainState method on DataProductListService instance and assign result ' +
      'to esDataProducts and dataSource properties',
      async () => {
        const expectedResponse: EsResponse<Deserializable<EsDataProduct>> = {
          total: 1,
          max_score: 1,
          hits: [ new EsDataProduct().deserialize({
            _index: '1',
            _source: {
              price: 1,
              transactions: []
            }
          }) ]
        };

        component.query = [ 'QUERY' ];
        component.sort = 'SORT';
        component.size = 10;
        component.from = 1;
        dataProductListServiceSpy.getDataProductsWithBlockchainState.and.callFake((query, sort, size, from) => {
          expect(query).toEqual({ bool: { must: [ { bool: { should: [ 'QUERY' ] } } ] } });
          expect(sort).toBe('SORT');
          expect(size).toBe(10);
          expect(from).toBe(1);
          return fromPromise(Promise.resolve(expectedResponse));
        });
        await component.refreshData();
        expect(dataProductListServiceSpy.getDataProductsWithBlockchainState.calls.count()).toBe(1);
        expect(component.esDataProducts).toBe(expectedResponse);
      });
  });

  describe('#DOM', () => {
    beforeEach(() => {
      component.esDataProducts = {
        total: 1,
        max_score: 1,
        hits: []
      };
      const dataProducts = component.esDataProducts.hits.map((esDataProduct: EsDataProduct) => esDataProduct.source);
      component.dataSource = new MatTableDataSource(dataProducts);
      fixture.detectChanges();
    });

    it('should display table with data provided by dataSource property', () => {
      const transactions = [ {
        finalised: false
      } ];
      component.esDataProducts = {
        total: 1,
        max_score: 1,
        hits: [ new EsDataProduct().deserialize({
          _index: '1',
          _source: {
            title: 'test title',
            name: 'test name',
            category: [ 'test category 1', 'test category 2' ],
            size: 1024,
            price: '1000000000000000000',
            daysForDeliver: '1',
            fundsToWithdraw: '0',
            transactions
          }
        }) ]
      };
      const dataProducts = component.esDataProducts.hits.map((esDataProduct: EsDataProduct) => esDataProduct.source);
      component.dataSource = new MatTableDataSource(dataProducts);
      component.displayedColumns = [
        'name',
        'title',
        'category',
        'daysForDeliver',
        'size',
        'price',
        'timesPurchased',
        'totalEarnings',
        'fundsToWithdraw',
        'pendingFinalisationRequests',
        'actions'
      ];
      component.availableActions = [
        'buy',
        'withdraw',
        'unpublish'
      ];
      component.getTransactionsToFinalisation = () => <any> transactions;
      component.displayPendingTransactions = true;
      fixture.detectChanges();

      const element: HTMLElement = fixture.nativeElement;
      const table = element.querySelector('mat-table');

      expect(table).toBeDefined();
      expect(table.getAttribute('matsort')).not.toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(1)').textContent.trim()).toBe('File name');
      expect(table.querySelector('mat-header-cell:nth-child(1)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(2)').textContent.trim()).toBe('Title');
      expect(table.querySelector('mat-header-cell:nth-child(2)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(3)').textContent.trim()).toBe('Categories');
      expect(table.querySelector('mat-header-cell:nth-child(3)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(4)').textContent.trim()).toBe('Delivery time  help');
      expect(table.querySelector('mat-header-cell:nth-child(4)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(5)').textContent.trim()).toBe('Size');
      expect(table.querySelector('mat-header-cell:nth-child(5)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(6)').textContent.trim()).toBe('List price');
      expect(table.querySelector('mat-header-cell:nth-child(6)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(7)').textContent.trim()).toBe('Times purchased');
      expect(table.querySelector('mat-header-cell:nth-child(7)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(8)').textContent.trim()).toBe('Total earnings');
      expect(table.querySelector('mat-header-cell:nth-child(8)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(9)').textContent.trim()).toBe('Total deposit  help');
      expect(table.querySelector('mat-header-cell:nth-child(9)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(10)').textContent.trim()).toBe('Pending finalisation requests');
      expect(table.querySelector('mat-header-cell:nth-child(10)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('mat-header-cell:nth-child(11)').textContent.trim()).toBe('');
      expect(table.querySelector('mat-header-cell:nth-child(11)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelectorAll('[mat-row]').length).toBe(1);

      const firstRow = table.querySelector('[mat-row]');
      expect(firstRow.querySelector('mat-cell:nth-child(1)').textContent.trim()).toBe('test name');
      expect(firstRow.querySelector('mat-cell:nth-child(2)').textContent.trim()).toBe('test title');
      expect(firstRow.querySelector('mat-cell:nth-child(3)').textContent.trim()).toBe('test category 1, test category 2');
      expect(firstRow.querySelector('mat-cell:nth-child(4)').textContent.trim()).toBe('1');
      expect(firstRow.querySelector('mat-cell:nth-child(5)').textContent.trim()).toBe('1.00 KB');
      expect(firstRow.querySelector('mat-cell:nth-child(6)').textContent.trim()).toBe('REPUX 1');
      expect(firstRow.querySelector('mat-cell:nth-child(7)').textContent.trim()).toBe('0');
      expect(firstRow.querySelector('mat-cell:nth-child(8)').textContent.trim()).toBe('REPUX 0');
      expect(firstRow.querySelector('mat-cell:nth-child(9)').textContent.trim()).toBe('REPUX 0');
      expect(firstRow.querySelector('mat-cell:nth-child(10)').textContent.trim()).toBe('1');
      expect(firstRow.querySelector('mat-cell:nth-child(11) app-marketplace-action-buttons')).not.toBeNull();

      expect(table.querySelectorAll('app-marketplace-data-product-transactions-list-container').length).toBe(1);
    });

    it('should call sortChanged method when user clicks on sorting column', () => {
      const sortChanged = spyOn(component, 'sortChanged');
      const element = fixture.debugElement.nativeElement.querySelector('mat-table');
      element.dispatchEvent(new CustomEvent('matSortChange'));

      expect(sortChanged.calls.count()).toBe(1, 'one call');
    });

    it('should call applyFilter method when user changes search input value', () => {
      const applyFilter = spyOn(component, 'applyFilter');
      const element = fixture.debugElement.nativeElement.querySelector('input');
      element.dispatchEvent(new CustomEvent('keyup'));

      expect(applyFilter.calls.count()).toBe(1, 'one call');
    });

    it('should call pageChanged method when user changes pagination settings', () => {
      const pageChanged = spyOn(component, 'pageChanged');
      const element = fixture.debugElement.nativeElement.querySelector('mat-paginator');
      element.dispatchEvent(new CustomEvent('page'));

      expect(pageChanged.calls.count()).toBe(1, 'one call');
    });

    it('should bind paginator attributes', () => {
      component.size = 13;
      component.pageSizeOptions = [ 1, 3, 13, 22 ];
      fixture.detectChanges();
      const element = fixture.debugElement.nativeElement.querySelector('mat-paginator');
      expect(element.getAttribute('ng-reflect-page-size-options')).toBe('1,3,13,22');
      expect(element.getAttribute('ng-reflect-page-size')).toBe('13');
      expect(element.getAttribute('ng-reflect-length')).toBe('1');
    });

    it('should display search icon before input and \'Search\' as a placeholder', () => {
      const element = fixture.debugElement.nativeElement.querySelector('mat-form-field');
      expect(element.querySelector('mat-icon').getAttribute('matprefix')).not.toBeNull();
      expect(element.querySelector('mat-icon').textContent).toBe('search');
      expect(element.querySelector('input').getAttribute('placeholder')).toBe('Search');
    });
  });
});
