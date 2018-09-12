import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MatRadioChange } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, flatMap, pluck } from 'rxjs/operators';
// tslint:disable-next-line:max-line-length
import { DimensionsMetricsSelection } from '../marketplace-analytics-dimesions-metrics-explorer/marketplace-analytics-dimensions-metrics-explorer.component';
import { DatePipe } from '@angular/common';
import { LOCALE_ID } from '@angular/core';

export interface AnalyticsView {
  id: string;
  websiteUrl: string;
  name: string;
}

export enum MarketplaceProductCreatorAnalyticsDialogStatus {
  ViewSelection,
  ReportGeneration,
  FileUpload
}

@Component({
  selector: 'app-marketplace-product-creator-analytics-dialog',
  templateUrl: './marketplace-product-creator-analytics-dialog.component.html',
  styleUrls: [ './marketplace-product-creator-analytics-dialog.component.scss' ]
})
export class MarketplaceProductCreatorAnalyticsDialogComponent implements OnInit, OnDestroy {
  @Input() accessToken: string;

  title = 'Add data from Google Analytics';
  availableViews$: Observable<AnalyticsView[]>;
  loadingError$ = new Subject<Error>();
  statuses = MarketplaceProductCreatorAnalyticsDialogStatus;
  status: MarketplaceProductCreatorAnalyticsDialogStatus;
  selectedView: AnalyticsView;
  file: File;
  shortDescription: string;
  reportError: Error;
  metrics: string[];
  dimensions: string[];
  explorerVisible = false;

  deafultMetrics = [ 'ga:users' ];
  defaultDimensions = [ 'ga:date' ];

  private reportSubscription: Subscription;
  private reportRequest = {
    viewId: undefined,
    dateRanges: [
      {
        startDate: '30daysAgo',
        endDate: 'yesterday'
      }
    ],
    metrics: [],
    dimensions: []
  };

  constructor(
    private dialogRef: MatDialogRef<MarketplaceProductCreatorAnalyticsDialogComponent>,
    private http: HttpClient,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.status = MarketplaceProductCreatorAnalyticsDialogStatus.ViewSelection;
    this.resetMetricsDimensions();
  }

  ngOnInit() {
    this.availableViews$ = <Observable<AnalyticsView[]>> this.http.get(
      `https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties/~all/profiles?access_token=${this.accessToken}`
    ).pipe(
      pluck('items'),
      catchError((response: any) => {
        this.loadingError$.next(response.error.error.errors[ 0 ]);
        return of();
      }),
      flatMap(availableViews => {
        this.selectedView = availableViews[ 0 ];
        return of(availableViews);
      })
    );
  }

  ngOnDestroy() {
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }
  }

  changeExplorerVisible(event: MatRadioChange) {
    this.explorerVisible = event.value;

    if (!this.explorerVisible) {
      this.resetMetricsDimensions();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  generateReport(date: Date = new Date()): Promise<any> {
    if (!this.selectedView) {
      return;
    }

    this.status = MarketplaceProductCreatorAnalyticsDialogStatus.ReportGeneration;
    this.reportRequest.viewId = this.selectedView.id;

    this.reportRequest.metrics = this.metrics.map(metric => {
      return {
        expression: metric
      };
    });
    this.reportRequest.dimensions = this.dimensions.map(dimension => {
      return {
        name: dimension
      };
    });

    return new Promise((resolve, reject) => {
      this.reportSubscription = this.http.post(
        `https://analyticsreporting.googleapis.com/v4/reports:batchGet?access_token=${this.accessToken}`,
        { reportRequests: [ this.reportRequest ] }
      ).pipe(
        catchError((response: any) => {
          this.status = MarketplaceProductCreatorAnalyticsDialogStatus.ViewSelection;
          if (response.error.error.errors) {
            this.loadingError$.next(response.error.error.errors[ 0 ]);
          } else {
            this.reportError = response.error.error;
          }
          reject();
          return of();
        })
      ).subscribe(report => {
        this.onReportGenerationFinish(report, date.getTime());
        resolve(report);
      });
    });
  }

  onDimensionsMetricsChange(event: DimensionsMetricsSelection) {
    this.metrics = event.metrics;
    this.dimensions = event.dimensions;
  }

  resetMetricsDimensions() {
    this.metrics = this.deafultMetrics.slice(0);
    this.dimensions = this.defaultDimensions.slice(0);
  }

  private onReportGenerationFinish(report: any, generationDate: number): void {
    this.file = new File([ new Blob([ JSON.stringify(report) ]) ], `analytics-report-${generationDate}.json`);
    this.shortDescription = this.generateDescription(generationDate, this.reportRequest, report);
    this.status = MarketplaceProductCreatorAnalyticsDialogStatus.FileUpload;
  }

  private generateDescription(generationDate: number, request: any, report: any) {
    const datePipe = new DatePipe(this.locale);

    return `Name: Google Analytics report
Website: ${ this.selectedView.websiteUrl }
Generation date: ${ datePipe.transform(generationDate, 'short') }
Rows number: ${ report.reports[ 0 ].data.rows.length }
Report parameters:
   startDate: ${ request.dateRanges[ 0 ].startDate }
   endDate: ${ request.dateRanges[ 0 ].endDate }
   metrics: ${ request.metrics.map(metric => metric.expression).join(', ') }
   dimensions: ${ request.dimensions.map(dimension => dimension.name).join(', ') }`;
  }
}

