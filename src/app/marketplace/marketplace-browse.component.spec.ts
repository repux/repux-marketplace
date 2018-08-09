import { MatDialog } from '@angular/material';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketplaceBrowseComponent } from './marketplace-browse.component';
import { Component, Input } from '@angular/core';
import { MaterialModule } from '../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { FileSizePipe } from '../shared/pipes/file-size.pipe';
import { EulaTypePipe } from '../shared/pipes/eula-type.pipe';
import { DataProduct } from '../shared/models/data-product';
import { IpfsService } from '../services/ipfs.service';
import { PendingFinalisationService } from './services/pending-finalisation.service';
import { DataProductListService } from '../services/data-product-list.service';
import { EsResponse } from '../shared/models/es-response';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Observable, of } from 'rxjs';


@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: string[];
}

@Component({ selector: 'app-data-product-list', template: '' })
class DataProductListStubComponent {
  @Input() staticQuery: {};
}

describe('MarketplaceBrowseComponent', () => {
  let component: MarketplaceBrowseComponent;
  let fixture: ComponentFixture<MarketplaceBrowseComponent>;
  let matDialog;
  let dataProductListServiceSpy, pendingFinalisationServiceSpy, ipfsServiceSpy;

  beforeEach(fakeAsync(() => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    pendingFinalisationServiceSpy = jasmine.createSpyObj('PendingFinalisationService', [ 'findTransaction' ]);
    dataProductListServiceSpy = jasmine.createSpyObj('DataProductListService', [ 'getDataProducts', 'getDataProductsWithBlockchainState', 'getBlockchainStateForDataProducts' ]);
    dataProductListServiceSpy.getDataProducts.and.callFake(() => {
      const response = new EsResponse();
      response.hits = [];
      return fromPromise(Promise.resolve(response));
    });
    dataProductListServiceSpy.getDataProductsWithBlockchainState.and.callFake(() => {
      const response = new EsResponse();
      response.hits = [];
      return fromPromise(Promise.resolve(response));
    });
    ipfsServiceSpy = jasmine.createSpyObj('IpfsService', [ 'downloadAndSave' ]);

    TestBed.configureTestingModule({
      declarations: [
        DataProductListStubComponent,
        MarketplaceBrowseComponent,
        MarketplaceActionButtonsStubComponent,
        FileSizePipe,
        EulaTypePipe
      ],
      imports: [
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

    fixture = TestBed.createComponent(MarketplaceBrowseComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  describe('#DOM', () => {
    beforeEach(() => {
      component.products$ = of([]);
      fixture.detectChanges();
    });

    it('should render all elements', () => {
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('.empty-list')).not.toBeNull();
    });
  });
});
