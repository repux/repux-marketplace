import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, flatMap, pluck } from 'rxjs/operators';

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

  private reportSubscription: Subscription;
  private reportRequest = {
    viewId: undefined,
    dateRanges: [
      {
        startDate: '30daysAgo',
        endDate: 'yesterday'
      }
    ],
    metrics: [
      {
        expression: 'ga:users',
        alias: ''
      }
    ],
    dimensions: [
      {
        name: 'ga:date'
      }
    ]
  };

  constructor(
    private dialogRef: MatDialogRef<MarketplaceProductCreatorAnalyticsDialogComponent>,
    private http: HttpClient,
  ) {
    this.status = MarketplaceProductCreatorAnalyticsDialogStatus.ViewSelection;
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

  closeDialog() {
    this.dialogRef.close();
  }

  generateReport(date: Date = new Date()): Promise<any> {
    if (!this.selectedView) {
      return;
    }

    this.status = MarketplaceProductCreatorAnalyticsDialogStatus.ReportGeneration;
    this.reportRequest.viewId = this.selectedView.id;

    return new Promise((resolve, reject) => {
      this.reportSubscription = this.http.post(
        `https://analyticsreporting.googleapis.com/v4/reports:batchGet?access_token=${this.accessToken}`,
        { reportRequests: [ this.reportRequest ] }
      ).pipe(
        catchError((response: any) => {
          this.status = MarketplaceProductCreatorAnalyticsDialogStatus.ViewSelection;
          this.loadingError$.next(response.error.error.errors[ 0 ]);
          reject();
          return of();
        })
      ).subscribe(report => {
        this.onReportGenerationFinish(report, date.getTime());
        resolve(report);
      });
    });
  }

  private onReportGenerationFinish(report: any, generationDate: number): void {
    this.file = new File([ new Blob([ JSON.stringify(report) ]) ], `analytics-report-${generationDate}.json`);
    this.shortDescription = this.generateDescription(generationDate, this.reportRequest, report);
    this.status = MarketplaceProductCreatorAnalyticsDialogStatus.FileUpload;
  }

  private generateDescription(generationDate: number, request: any, report: any) {
    return `Name: Google Analytics report
Website: ${ this.selectedView.websiteUrl }
Generation date: ${ generationDate }
Rows number: ${ report.reports[ 0 ].data.rows.length }
Report parameters:
   startDate: ${ request.dateRanges[ 0 ].startDate }
   endDate: ${ request.dateRanges[ 0 ].endDate }
   metrics: ${ request.metrics.map(metric => metric.expression).join(', ') }
   dimensions: ${ request.dimensions.map(dimension => dimension.name).join(', ') }`;
  }
}

