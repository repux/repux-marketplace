import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from '../../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { MarketplaceAnalyticsDimensionsMetricsExplorerComponent } from './marketplace-analytics-dimensions-metrics-explorer.component';

describe('MarketplaceAnalyticsDimensionsMetricsExplorer', () => {
  let component: MarketplaceAnalyticsDimensionsMetricsExplorerComponent;
  let fixture: ComponentFixture<MarketplaceAnalyticsDimensionsMetricsExplorerComponent>;

  let httpClientSpy;

  const metric = {
    id: 'ga:users',
    kind: 'analytics#column',
    attributes: {
      type: 'METRIC',
      dataType: 'INTEGER',
      group: 'User',
      status: 'PUBLIC',
      uiName: 'Users',
      description: 'The total number of users for the requested time period.',
      addedInApiVersion: '3'
    }
  };
  const dimension = {
    id: 'ga:date',
    kind: 'analytics#column',
    attributes: {
      type: 'DIMENSION',
      dataType: 'STRING',
      group: 'Time',
      status: 'PUBLIC',
      uiName: 'Date',
      description: 'The date of the session formatted as YYYYMMDD.',
      addedInApiVersion: '3'
    }
  };

  beforeEach(async () => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', [ 'get', 'post' ]);
    httpClientSpy.get.and.returnValue(of({
      items: [ metric, dimension ]
    }));

    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceAnalyticsDimensionsMetricsExplorerComponent,
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceAnalyticsDimensionsMetricsExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#ngOnInit()', () => {
    it('should fetch ga columns', async () => {
      await component.ngOnInit();

      expect(component.columns).toEqual(<any> {
        User: {
          DIMENSION: [],
          METRIC: [ metric ]
        },
        Time: {
          DIMENSION: [ dimension ],
          METRIC: []
        }
      });
    });
  });

  describe('#changeDimensionSelection()', () => {
    it('should update selectedDimensions', () => {
      expect(component.selectedDimensions).toEqual([]);
      expect(component.intersectedCubes.length).toBe(0);

      component.changeDimensionSelection(<any> { checked: true }, 'ga:userType');

      expect(component.selectedDimensions).toEqual([ 'ga:userType' ]);
      expect(component.intersectedCubes.length).toBe(16);

      component.changeDimensionSelection(<any> { checked: true }, 'ga:sessionCount');

      expect(component.selectedDimensions).toEqual([ 'ga:userType', 'ga:sessionCount' ]);
      expect(component.intersectedCubes.length).toBe(12);

      component.changeDimensionSelection(<any> { checked: false }, 'ga:userType');

      expect(component.selectedDimensions).toEqual([ 'ga:sessionCount' ]);
      expect(component.intersectedCubes.length).toBe(14);
    });
  });

  describe('#changeMetricSelection()', () => {
    it('should update selectedMetrics', () => {
      expect(component.selectedMetrics).toEqual([]);
      expect(component.intersectedCubes.length).toBe(0);

      component.changeMetricSelection(<any> { checked: true }, 'ga:users');

      expect(component.selectedMetrics).toEqual([ 'ga:users' ]);
      expect(component.intersectedCubes.length).toBe(52);

      component.changeMetricSelection(<any> { checked: true }, 'ga:sessionsPerUser');

      expect(component.selectedMetrics).toEqual([ 'ga:users', 'ga:sessionsPerUser' ]);
      expect(component.intersectedCubes.length).toBe(48);

      component.changeMetricSelection(<any> { checked: false }, 'ga:users');

      expect(component.selectedMetrics).toEqual([ 'ga:sessionsPerUser' ]);
      expect(component.intersectedCubes.length).toBe(48);
    });
  });

  describe('#isInputDisabled()', () => {
    it('should return true when input should be disabled', () => {
      component.changeDimensionSelection(<any> { checked: true }, 'ga:sessionCount');

      expect(component.isInputDisabled('ga:userType')).toBe(false);
      expect(component.isInputDisabled('ga:1dayUsers')).toBe(true);
    });
  });
});
