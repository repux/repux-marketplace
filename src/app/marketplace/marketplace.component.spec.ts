import { MatDialog, MatDialogModule, MatIconModule } from '@angular/material';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketplaceComponent } from './marketplace.component';
import { ProductCreatorDialogComponent } from '../product-creator-dialog/product-creator-dialog.component';
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() staticQuery: {};
}

describe('MarketplaceComponent', () => {
  let component: MarketplaceComponent;
  let fixture: ComponentFixture<MarketplaceComponent>;
  let matDialog;

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        DataProductListStubComponent,
        MarketplaceComponent
      ],
      imports: [
        MatDialogModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialog, useValue: matDialog }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceComponent);
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

      expect(element.querySelector('app-data-product-list')).not.toBeNull();
      expect(element.querySelector('.add-product-button')).not.toBeNull();
      expect(element.querySelector('.add-product-button').getAttribute('matTooltip')).toBe('Create new product');
    });
  });
});
