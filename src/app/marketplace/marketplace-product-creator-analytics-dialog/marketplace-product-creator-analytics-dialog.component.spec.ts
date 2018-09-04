import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material.module';
import {
  AnalyticsView,
  MarketplaceProductCreatorAnalyticsDialogComponent, MarketplaceProductCreatorAnalyticsDialogStatus
} from './marketplace-product-creator-analytics-dialog.component';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material';
import { of } from 'rxjs';
// tslint:disable-next-line:max-line-length
import { DimensionsMetricsSelection } from '../marketplace-analytics-dimesions-metrics-explorer/marketplace-analytics-dimensions-metrics-explorer.component';

@Component({ selector: 'app-marketplace-product-creator-dialog', template: '' })
class MarketplaceProductCreatorDialogStubComponent {
  @Input() dialogTitle: string;
  @Input() title: string;
  @Input() file: File;
  @Input() shortDescription: string;
}

@Component({ selector: 'app-marketplace-analytics-dimensions-metrics-explorer', template: '' })
class MarketplaceAnalyticsDimensionsMetricsExplorerStubComponent {
  @Input() selectedMetrics: string[];
  @Input() selectedDimensions: string[];
  @Output() change = new EventEmitter<DimensionsMetricsSelection>();
}

describe('MarketplaceProductCreatorAnalyticsDialogComponent', () => {
  let component: MarketplaceProductCreatorAnalyticsDialogComponent;
  let fixture: ComponentFixture<MarketplaceProductCreatorAnalyticsDialogComponent>;

  let httpClientSpy;

  const token = 'TOKEN';
  const analyticsView = {
    id: '1',
    websiteUrl: 'http://example.com',
    name: 'Example view',
  } as AnalyticsView;

  beforeEach(async () => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', [ 'get', 'post' ]);
    httpClientSpy.get.and.returnValue(of({
      items: [ analyticsView ]
    }));

    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceProductCreatorAnalyticsDialogComponent,
        MarketplaceProductCreatorDialogStubComponent,
        MarketplaceAnalyticsDimensionsMetricsExplorerStubComponent
      ],
      imports: [
        SharedModule,
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: MatDialogRef, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceProductCreatorAnalyticsDialogComponent);
    component = fixture.componentInstance;
    component.accessToken = token;
    fixture.detectChanges();
  });

  describe('#ngOnInit()', () => {
    it('should call http.get to fetch availableViews', async () => {
      return new Promise(resolve => {
        component.availableViews$.subscribe(views => {
          expect(views).toEqual([ analyticsView ]);
          expect(httpClientSpy.get.calls.allArgs()[ 0 ]).toEqual([
            'https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties/~all/profiles?access_token=TOKEN'
          ]);
          resolve();
        });
      });
    });
  });

  describe('#ngOnDestroy()', () => {
    it('should call reportSubscription.unsubscribe', () => {
      const unsubscribe = jasmine.createSpy();
      component[ 'reportSubscription' ] = <any> {
        unsubscribe
      };

      component.ngOnDestroy();

      expect(unsubscribe.calls.count()).toBe(1);
    });
  });

  describe('#generateReport()', () => {
    it('should call http.post to fetch report', async () => {
      const expectedReport = {
        reports: [ {
          data: {
            rows: []
          }
        } ]
      };

      component.selectedView = analyticsView;
      component.metrics = [ 'example_metric_1', 'example_metric_2' ];
      component.dimensions = [ 'example_dimension_1' ];
      httpClientSpy.post.and.returnValue(of(expectedReport));

      const generationDate = new Date();
      const report = await component.generateReport(generationDate);

      expect(report).toEqual(expectedReport);
      expect(component.file).toBeDefined();
      expect(component.status).toBe(MarketplaceProductCreatorAnalyticsDialogStatus.FileUpload);
      expect(httpClientSpy.post.calls.allArgs()[ 0 ][ 1 ]).toEqual({
        reportRequests: [ {
          viewId: analyticsView.id,
          dateRanges: [
            {
              startDate: '30daysAgo',
              endDate: 'yesterday'
            }
          ],
          metrics: [ {
            expression: 'example_metric_1'
          }, {
            expression: 'example_metric_2'
          } ],
          dimensions: [ {
            name: 'example_dimension_1'
          } ]
        } ]
      });
      expect(component.shortDescription).toBe(`Name: Google Analytics report
Website: http://example.com
Generation date: ${ generationDate.getTime() }
Rows number: 0
Report parameters:
   startDate: 30daysAgo
   endDate: yesterday
   metrics: example_metric_1, example_metric_2
   dimensions: example_dimension_1`);
    });
  });
});
