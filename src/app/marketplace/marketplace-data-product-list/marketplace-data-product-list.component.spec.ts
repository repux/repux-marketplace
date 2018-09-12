import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceDataProductListComponent } from './marketplace-data-product-list.component';
import { MatTableDataSource } from '@angular/material';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataProductListService } from '../../services/data-product-list.service';
import { from as fromPromise } from 'rxjs';
import { EsResponse } from '../../shared/models/es-response';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DataProduct } from '../../shared/models/data-product';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { PendingFinalisationService } from '../services/pending-finalisation.service';
import { IpfsService } from '../../services/ipfs.service';
import { EulaType } from 'repux-lib';
import { ActionButtonType } from '../../shared/enums/action-button-type';
import { FormsModule } from '@angular/forms';

@Component({ selector: 'app-file-size', template: '{{bytes}}' })
class MarketplaceFileSizeStubComponent {
  @Input() bytes: number;
}

@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: ActionButtonType[];
}

@Component({ selector: 'app-marketplace-data-product-orders-list-container', template: '' })
class DataProductOrdersListContainerStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() displayPendingOrders: boolean;
  @Output() finaliseSuccess = new EventEmitter<any>();
}

describe('MarketplaceDataProductListComponent', () => {
  let component: MarketplaceDataProductListComponent;
  let fixture: ComponentFixture<MarketplaceDataProductListComponent>;
  let dataProductListServiceSpy, pendingFinalisationServiceSpy, ipfsServiceSpy;

  beforeEach(async(() => {
    pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'findOrder' ]);
    dataProductListServiceSpy = jasmine.createSpyObj('DataProductListService', [ 'getDataProductsWithBlockchainState' ]);
    dataProductListServiceSpy.getDataProductsWithBlockchainState.and.callFake(() => {
      const response = new EsResponse();
      response.hits = [];
      return fromPromise(Promise.resolve(response));
    });
    ipfsServiceSpy = jasmine.createSpyObj('IpfsService', [ 'downloadAndSave' ]);

    TestBed.configureTestingModule({
      declarations: [
        MarketplaceDataProductListComponent,
        MarketplaceFileSizeStubComponent,
        MarketplaceActionButtonsStubComponent,
        DataProductOrdersListContainerStubComponent
      ],
      imports: [
        SharedModule,
        FormsModule,
        MaterialModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DataProductListService, useValue: dataProductListServiceSpy },
        { provide: PendingFinalisationService, useValue: pendingFinalisationServiceSpy },
        { provide: IpfsService, useValue: ipfsServiceSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceDataProductListComponent);
    component = fixture.componentInstance;
    component.readQueryParams = () => {};
    fixture.detectChanges();
  });

  describe('#applyFilter()', () => {
    it('should add filterValue to query attribute and should set from attribute to 0', () => {
      component.from = 5;
      component.onTypeAhead('String to search for');
      component.applyFilter();
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
      component.applyFilter();
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
      expect(component.sort).toEqual({ 'name.keyword': { order: 'asc' } });
      component.sortChanged({ active: 'price', direction: 'asc' });
      expect(component.sort).toEqual({ 'price.numeric': { order: 'asc' } });
      component.sortChanged({ active: null, direction: 'asc' });
      expect(component.sort).toEqual({});
      component.sortChanged({ active: 'name', direction: '' });
      expect(component.sort).toEqual({});
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
        const expectedResponse: EsResponse<DataProduct> = {
          total: 1,
          max_score: 1,
          hits: [ new DataProduct().deserialize({
            _index: '1',
            _source: {
              price: 1,
              orders: []
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

    it('should change sort to defaultSort when user not specify any', async () => {
      const expectedResponse: EsResponse<DataProduct> = {
        total: 1,
        max_score: 1,
        hits: [ new DataProduct().deserialize({
          _index: '1',
          _source: {
            price: 1,
            orders: []
          }
        }) ]
      };

      component.query = [ 'QUERY' ];
      component.defaultSort = { defaultSort: { order: 'asc' } };
      component.nestedSortFilters = { defaultSort: { nested_filter: 'SOME_FILTER', nested_path: 'SOME_PATH' } };
      component.sort = {};
      component.size = 10;
      component.from = 1;
      dataProductListServiceSpy.getDataProductsWithBlockchainState.and.callFake((query, sort, size, from) => {
        console.log(query);

        expect(query).toEqual({ bool: { must: [ { bool: { should: [ 'QUERY' ] } } ] } });
        expect(sort).toEqual({
          defaultSort: {
            order: 'asc',
            nested_filter: 'SOME_FILTER',
            nested_path: 'SOME_PATH'
          }
        });
        expect(size).toBe(10);
        expect(from).toBe(1);
        return fromPromise(Promise.resolve(expectedResponse));
      });
      await component.refreshData();
      expect(component.sortActive).toBe('defaultSort');
      expect(component.sortDirection).toBe('asc');
      expect(dataProductListServiceSpy.getDataProductsWithBlockchainState.calls.count()).toBe(1);
      expect(component.esDataProducts).toBe(expectedResponse);
    });
  });

  describe('#downloadEula()', () => {
    it('should call ipfsService.downloadAndSave() method', async () => {
      const event = jasmine.createSpyObj('MouseEvent', [ 'stopPropagation', 'preventDefault' ]);
      const eula = {
        type: EulaType.OWNER,
        fileHash: 'FILE_HASH',
        fileName: 'FILE_NAME'
      };

      await component.downloadEula(event, eula);

      expect(event.stopPropagation.calls.count()).toBe(1);
      expect(ipfsServiceSpy.downloadAndSave.calls.allArgs()[ 0 ][ 0 ]).toBe(eula.fileHash);
      expect(ipfsServiceSpy.downloadAndSave.calls.allArgs()[ 0 ][ 1 ]).toBe(eula.fileName);
    });
  });

  describe('#DOM', () => {
    beforeEach(() => {
      component.esDataProducts = {
        total: 1,
        max_score: 1,
        hits: []
      };
      component.dataSource = new MatTableDataSource(component.esDataProducts.hits);
      fixture.detectChanges();
    });

    it('should display table with data provided by dataSource property', () => {
      const orders = [ {
        finalised: false
      } ];
      component.esDataProducts = {
        total: 1,
        max_score: 1,
        hits: [ new DataProduct().deserialize({
          title: 'test title',
          name: 'test name',
          category: [ 'test category 1', 'test category 2' ],
          size: 1024,
          price: '1000000000000000000',
          daysToDeliver: '1',
          fundsToWithdraw: '0',
          eula: {
            type: EulaType.OWNER,
            fileName: 'EULA',
            fileHash: 'EULA_HASH'
          },
          orders
        }) ]
      };
      component.dataSource = new MatTableDataSource(component.esDataProducts.hits);
      component.displayedColumns = [
        'title',
        'price',
        'timesPurchased',
        'totalEarnings',
        'fundsToWithdraw',
        'pendingFinalisationRequests',
        'eula',
        'actions'
      ];
      component.availableActions = [
        ActionButtonType.Buy,
        ActionButtonType.Withdraw,
        ActionButtonType.Unpublish
      ];
      component.getOrdersToFinalisation = () => <any> orders;
      component.displayPendingOrders = true;
      fixture.detectChanges();

      const element: HTMLElement = fixture.nativeElement;
      const table = element.querySelector('.mat-table');

      expect(table).toBeDefined();
      expect(table.getAttribute('matsort')).not.toBeNull();
      expect(table.querySelector('.mat-header-cell:nth-child(1)').textContent.trim()).toBe('File details');
      expect(table.querySelector('.mat-header-cell:nth-child(1)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('.mat-header-cell:nth-child(2)').textContent.trim()).toBe('Price (REPUX)');
      expect(table.querySelector('.mat-header-cell:nth-child(2)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('.mat-header-cell:nth-child(3)').textContent.trim()).toBe('Purchased');
      expect(table.querySelector('.mat-header-cell:nth-child(3)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('.mat-header-cell:nth-child(4)').textContent.trim()).toBe('Total Earnings (REPUX)');
      expect(table.querySelector('.mat-header-cell:nth-child(4)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('.mat-header-cell:nth-child(5)').textContent.trim()).toBe('Deposit (REPUX)  help_outline');
      expect(table.querySelector('.mat-header-cell:nth-child(5)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('.mat-header-cell:nth-child(6)').textContent.trim()).toBe('Finalisation requests');
      expect(table.querySelector('.mat-header-cell:nth-child(6)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('.mat-header-cell:nth-child(7)').textContent.trim()).toBe('EULA  help_outline');
      expect(table.querySelector('.mat-header-cell:nth-child(7)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('.mat-header-cell:nth-child(8)').textContent.trim()).toBe('');
      expect(table.querySelector('.mat-header-cell:nth-child(8)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelectorAll('[mat-row]').length).toBe(1);

      const firstRow = table.querySelector('[mat-row]');
      expect(firstRow.querySelector('.mat-cell:nth-child(1)').textContent.trim()).toBe('test titletest name | 1.00 KB');
      expect(firstRow.querySelector('.mat-cell:nth-child(2)').textContent.trim()).toBe('1.00');
      expect(firstRow.querySelector('.mat-cell:nth-child(3)').textContent.trim()).toBe('0');
      expect(firstRow.querySelector('.mat-cell:nth-child(4)').textContent.trim()).toBe('0.00');
      expect(firstRow.querySelector('.mat-cell:nth-child(5)').textContent.trim()).toBe('0.00');
      expect(firstRow.querySelector('.mat-cell:nth-child(6)').textContent.trim()).toBe('1');
      expect(firstRow.querySelector('.mat-cell:nth-child(7) a').textContent.trim()).toBe('Owner');
      expect(firstRow.querySelector('.mat-cell:nth-child(8) app-marketplace-action-buttons')).not.toBeNull();
    });

    it('should call sortChanged method when user clicks on sorting column', () => {
      const sortChanged = spyOn(component, 'sortChanged');
      const element = fixture.debugElement.nativeElement.querySelector('.mat-table');
      element.dispatchEvent(new CustomEvent('matSortChange'));

      expect(sortChanged.calls.count()).toBe(1, 'one call');
    });

    it('should call onTypeAhead method when user changes search input value', () => {
      const onTypeAhead = spyOn(component, 'onTypeAhead');
      const element = fixture.debugElement.nativeElement.querySelector('input');
      element.dispatchEvent(new Event('input'));

      expect(onTypeAhead.calls.count()).toBe(1, 'one call');
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
  });
});
