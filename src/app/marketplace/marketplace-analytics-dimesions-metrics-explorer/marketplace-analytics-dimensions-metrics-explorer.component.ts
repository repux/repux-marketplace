import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import analyticsConcepts from './marketplace-analytics-dimensions-metrics-concepts';
import analyticsCubes from './marketplace-analytics-dimensions-metrics-cubes';
import { map, pluck } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatCheckboxChange } from '@angular/material';
import { Subscription } from 'rxjs';
import { foldingAnimation } from '../../shared/animations/folding.animation';

interface MatadataColumnAttributes {
  type: string;
  dataType: string;
  group: string;
  status: string;
  uiName: string;
  description: string;
  allowedInSegments: string;
  addedInApiVersion: string;
}

interface MetadataColumn {
  id: string;
  kind: string;
  attributes: MatadataColumnAttributes;
}

export interface DimensionsMetricsSelection {
  dimensions: string[];
  metrics: string[];
}

@Component({
  selector: 'app-marketplace-analytics-dimensions-metrics-explorer',
  templateUrl: './marketplace-analytics-dimensions-metrics-explorer.component.html',
  styleUrls: [ './marketplace-analytics-dimensions-metrics-explorer.component.scss' ],
  animations: [ foldingAnimation('visibilityChanged') ]
})
export class MarketplaceAnalyticsDimensionsMetricsExplorerComponent implements OnInit, OnDestroy {
  @Input() selectedDimensions: string[] = [];
  @Input() selectedMetrics: string[] = [];
  @Output() change = new EventEmitter<DimensionsMetricsSelection>();

  concepts = analyticsConcepts;
  cubes = analyticsCubes;
  columns: Map<string, Map<string, MetadataColumn>>;
  openedColumns = {};
  intersectedCubes: string[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private http: HttpClient
  ) {
  }

  get columnsKeys(): string[] {
    if (!this.columns) {
      return [];
    }

    return Object.keys(this.columns);
  }

  toggleColumn(key: string): void {
    this.openedColumns[ key ] = !this.openedColumns[ key ];
  }

  ngOnInit(): Promise<void> {
    return new Promise(resolve => {
      this.subscriptions.push(
        this.http.get('https://www.googleapis.com/analytics/v3/metadata/ga/columns')
          .pipe(
            pluck('items'),
            map((items: MetadataColumn[]) => this.prepareColumnsObject(items))
          ).subscribe((columns: any) => this.onColumnsLoaded(columns) || resolve())
      );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  changeDimensionSelection(event: MatCheckboxChange, id: string): void {
    if (event.checked) {
      this.selectedDimensions = [ ...this.selectedDimensions, id ];
    } else {
      this.selectedDimensions = this.selectedDimensions.filter((_id: string) => _id !== id);
    }

    this.change.emit({ dimensions: this.selectedDimensions, metrics: this.selectedMetrics });
    this.onSelectionChange();
  }

  changeMetricSelection(event: MatCheckboxChange, id: string): void {
    if (event.checked) {
      this.selectedMetrics = [ ...this.selectedMetrics, id ];
    } else {
      this.selectedMetrics = this.selectedMetrics.filter((_id: string) => _id !== id);
    }

    this.change.emit({ dimensions: this.selectedDimensions, metrics: this.selectedMetrics });
    this.onSelectionChange();
  }

  isInputDisabled(id: string): boolean {
    if (!this.intersectedCubes.length) {
      return false;
    }

    return !this.intersectedCubes.find(cubeName => this.cubes[ cubeName ][ id ]);
  }

  private onSelectionChange(): void {
    const selected = [ ...this.selectedDimensions, ...this.selectedMetrics ];

    if (!selected.length) {
      this.intersectedCubes = [];
      return;
    }

    this.intersectedCubes = selected.map(id => this.concepts[ id ].cubes)
      .reduce((acc, cubes) => acc.filter(accCube => cubes.includes(accCube)), this.concepts[ selected[ 0 ] ].cubes);
  }

  private onColumnsLoaded(columns: any): void {
    this.columns = columns;
    this.onSelectionChange();

    this.openedColumns = {};
    this.columnsKeys.forEach((key: string) => this.openedColumns[ key ] = false);
    this.openedColumns[ 'User' ] = true;
    this.openedColumns[ 'Time' ] = true;
  }

  private prepareColumnsObject(items: MetadataColumn[]): Map<string, Map<string, MetadataColumn>> {
    return items
      .filter(item => item.attributes.status !== 'DEPRECATED')
      .reduce((acc, item) => {
        const group = item.attributes.group;
        const type = item.attributes.type;
        (acc[ group ] = acc[ group ] || { 'DIMENSION': [], 'METRIC': [] })[ type ].push(item);
        return acc;
      }, {}) as Map<string, Map<string, MetadataColumn>>;
  }
}
