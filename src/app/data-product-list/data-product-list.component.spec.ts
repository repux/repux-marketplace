import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DataProductListComponent } from './data-product-list.component';
import {
  MatInputModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatTableModule,
  MatPaginatorModule,
  MatTableDataSource
} from '@angular/material';
import { PipesModule } from '../pipes/pipes.module';
import { Component, Input } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { DataProductListService } from './data-product-list.service';
import { from as fromPromise, Observable } from 'rxjs/index';
import { EsResponse } from '../es-response';
import { Deserializable } from '../deserializable';
import { EsDataProduct } from '../es-data-product';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({selector: 'app-currency', template: '{{value}}'})
class CurrencyStubComponent {
  @Input() value: BigNumber;
}

@Component({selector: 'app-file-size', template: '{{bytes}}'})
class FileSizeStubComponent {
  @Input() bytes: number;
}

class DataProductListStubService {
  getFiles(query?: string, sort?: string, size?: number, from?: number): Observable<EsResponse<Deserializable<EsDataProduct>>> {
    return fromPromise(Promise.resolve(new EsResponse()));
  }
}

describe('DataProductListComponent', () => {
  let component: DataProductListComponent;
  let fixture: ComponentFixture<DataProductListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataProductListComponent,
        CurrencyStubComponent,
        FileSizeStubComponent
      ],
      imports: [
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatPaginatorModule,
        PipesModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DataProductListService, useClass: DataProductListStubService}
       ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#onNgInit()', () => {
    it('should call refreshData method', () => {
      const refreshData = spyOn(component, 'refreshData').and.callFake(() => {});
      component.ngOnInit();
      expect(refreshData.calls.count()).toBe(1, 'one call');
    })
  });

  describe('#applyFilter()', () => {
    it('should add filterValue to query attribute and should set from attribute to 0', () => {
      component.from = 5;
      component.applyFilter('String to search for');
      expect(component.from).toBe(0);
      expect(component.query).toBe('name:*string to search for* OR title:*string to search for* OR category:*string to search for*');
    });

    it('should call refreshData method', () => {
      const refreshData = spyOn(component, 'refreshData').and.callFake(() => {});
      component.applyFilter('');
      expect(refreshData.calls.count()).toBe(1, 'one call');
    });
  });

  describe('#pageChanged()', () => {
    it('should set size and from attributes basing on pageChangeEvent argument', () => {
      component.from = 0;
      component.size = 3;
      component.pageChanged( { pageSize: 10, pageIndex: 13, length: 10 });
      expect(component.size).toBe(10);
      expect(component.from).toBe(130);
    });

    it('should call refreshData method', () => {
      const refreshData = spyOn(component, 'refreshData').and.callFake(() => {});
      component.pageChanged({ pageSize: 10, pageIndex: 13, length: 10 });
      expect(refreshData.calls.count()).toBe(1, 'one call');
    });
  });

  describe('#sortChanged()', () => {
    it('should set sort property sort argument has active and direction properties set', () => {
      component.sort = null;
      component.sortChanged({ active: 'name', direction: 'asc' });
      expect(component.sort).toBe('name:asc');
      component.sortChanged({ active: null, direction: 'asc' });
      expect(component.sort).toBeUndefined();
      component.sortChanged({ active: 'name', direction: '' });
      expect(component.sort).toBeUndefined();
    });

    it('should call refreshData method', () => {
      const refreshData = spyOn(component, 'refreshData').and.callFake(() => {});
      component.sortChanged({ active: 'name', direction: 'asc' });
      expect(refreshData.calls.count()).toBe(1, 'one call');
    });
  });

  describe('#refreshData()', () => {
    it('should call getFiles method on DataProductListService instance and assign result to esDataProducts and dataSource properties', async () => {
      const expectedResponse: EsResponse<Deserializable<EsDataProduct>> = {
        total: 1,
        max_score: 1,
        hits: [new EsDataProduct().deserialize({
          _index: '1',
          _source: {
            price: 1
          }
        })]
      };

      component.query = 'QUERY';
      component.sort = 'SORT';
      component.size = 10;
      component.from = 1;
      const getFiles = spyOn(component.dataProductListService, 'getFiles').and.callFake((query, sort, size, from) => {
        expect(query).toBe('QUERY');
        expect(sort).toBe('SORT');
        expect(size).toBe(10);
        expect(from).toBe(1);
        return fromPromise(Promise.resolve(expectedResponse));
      });
      await component.refreshData();
      expect(getFiles.calls.count()).toBe(1, 'one call');
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
      component.dataSource = new MatTableDataSource(component.esDataProducts.hits);
      fixture.detectChanges();
    });

    it('should display table with data provided by dataSource property', () => {
      component.esDataProducts = {
        total: 1,
        max_score: 1,
        hits: [new EsDataProduct().deserialize({
          _index: '1',
          _source: {
            title: 'test title',
            name: 'test name',
            category: ['test category 1', 'test category 2'],
            size: 1024,
            price: 1
          }
        })]
      };
      component.dataSource = new MatTableDataSource(component.esDataProducts.hits);
      fixture.detectChanges();

      const element: HTMLElement = fixture.nativeElement;
      const table = element.querySelector('table');

      expect(table).toBeDefined();
      expect(table.getAttribute('matsort')).not.toBeNull();
      expect(table.querySelector('thead th:nth-child(1)').textContent.trim()).toBe('Name');
      expect(table.querySelector('thead th:nth-child(1)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('thead th:nth-child(2)').textContent.trim()).toBe('Title');
      expect(table.querySelector('thead th:nth-child(2)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('thead th:nth-child(3)').textContent.trim()).toBe('Categories');
      expect(table.querySelector('thead th:nth-child(3)').getAttribute('mat-sort-header')).toBeNull();
      expect(table.querySelector('thead th:nth-child(4)').textContent.trim()).toBe('Size');
      expect(table.querySelector('thead th:nth-child(4)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelector('thead th:nth-child(5)').textContent.trim()).toBe('Price');
      expect(table.querySelector('thead th:nth-child(5)').getAttribute('mat-sort-header')).not.toBeNull();
      expect(table.querySelectorAll('tbody tr').length).toBe(1);

      const firstRow = table.querySelector('tbody tr');
      expect(firstRow.querySelector('td:nth-child(1)').textContent.trim()).toBe('test name');
      expect(firstRow.querySelector('td:nth-child(2)').textContent.trim()).toBe('test title');
      expect(firstRow.querySelector('td:nth-child(3)').textContent.trim()).toBe('test category 1, test category 2');
      expect(firstRow.querySelector('td:nth-child(4)').textContent.trim()).toBe('1024');
      expect(firstRow.querySelector('td:nth-child(5)').textContent.trim()).toBe('0.000000000000000001');
    });

    it('should call sortChanged method when user clicks on sorting column', () => {
      const sortChanged = spyOn(component, 'sortChanged');
      const element = fixture.debugElement.nativeElement.querySelector('table');
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
      component.pageSizeOptions = [1, 3, 13, 22];
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
