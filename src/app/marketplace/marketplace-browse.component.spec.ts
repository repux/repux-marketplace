import { MatDialog } from '@angular/material';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketplaceBrowseComponent } from './marketplace-browse.component';
import { Component, Input } from '@angular/core';
import { MaterialModule } from '../material.module';
import {
  MarketplaceProductCreatorDialogComponent
} from './marketplace-product-creator-dialog/marketplace-product-creator-dialog.component';

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() staticQuery: {};
}

describe('MarketplaceBrowseComponent', () => {
  let component: MarketplaceBrowseComponent;
  let fixture: ComponentFixture<MarketplaceBrowseComponent>;
  let matDialog;

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        DataProductListStubComponent,
        MarketplaceBrowseComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialog, useValue: matDialog }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarketplaceBrowseComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#openProductCreatorDialog()', () => {
    it('should call open on _dialog property', () => {
      component.openProductCreatorDialog();
      expect(matDialog.open.calls.count()).toBe(1);
      expect(matDialog.open.calls.allArgs()[ 0 ][ 0 ]).toEqual(MarketplaceProductCreatorDialogComponent);
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
