import { MatChipsModule, MatDialog, MatDialogModule, MatIconModule, MatTabsModule } from '@angular/material';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductCreatorDialogComponent } from '../product-creator-dialog/product-creator-dialog.component';
import { SellComponent } from './sell.component';
import { DataProductNotificationsService } from '../services/data-product-notifications.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('SellComponent', () => {
  let component: SellComponent;
  let fixture: ComponentFixture<SellComponent>;
  let matDialog, dataProductNotificationsService;

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    dataProductNotificationsService = {
      finalisationRequests: []
    };

    TestBed.configureTestingModule({
      declarations: [
        SellComponent
      ],
      imports: [
        RouterTestingModule,
        MatTabsModule,
        MatDialogModule,
        MatChipsModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialog, useValue: matDialog },
        { provide: DataProductNotificationsService, useValue: dataProductNotificationsService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SellComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#openProductCreatorDialog()', () => {
    it('should call open on _dialog property', () => {
      component.openProductCreatorDialog();
      expect(matDialog.open.calls.count()).toBe(1);
      expect(matDialog.open.calls.allArgs()[ 0 ][ 0 ]).toEqual(ProductCreatorDialogComponent);
    });
  });

  describe('#DOM', () => {
    it('should render all elements', () => {
      const element: HTMLElement = fixture.nativeElement;

      expect(element.querySelector('.add-product-button')).not.toBeNull();
      expect(element.querySelector('.add-product-button').getAttribute('matTooltip')).toBe('Create new product');
    });
  });
});
