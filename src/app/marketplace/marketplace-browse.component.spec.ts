import { MatDialog } from '@angular/material';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketplaceBrowseComponent } from './marketplace-browse.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { FileSizePipe } from '../shared/pipes/file-size.pipe';
import { EulaTypePipe } from '../shared/pipes/eula-type.pipe';
import { DataProduct } from '../shared/models/data-product';
import { IpfsService } from '../services/ipfs.service';
import { DataProductListService } from '../services/data-product-list.service';
import { EsResponse } from '../shared/models/es-response';
import { fromPromise } from 'rxjs/internal-compatibility';
import { of } from 'rxjs';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { RepuxWeb3Service } from '../services/repux-web3.service';

@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: ActionButtonType[];
}

@Component({ selector: 'app-marketplace-product-category-selector', template: '' })
class MarketplaceProductCategorySelectorStubComponent {
  @Input() showAllCheckbox: boolean;
  @Input() placeholder: string;
  @Input() noUnderline: boolean;
  @Input() noFloatPlaceholder: boolean;
  @Input() noPadding: boolean;
  @Output() valueChange = new EventEmitter<string[]>();
}

describe('MarketplaceBrowseComponent', () => {
  let component: MarketplaceBrowseComponent;
  let fixture: ComponentFixture<MarketplaceBrowseComponent>;
  let matDialog;
  let dataProductListServiceSpy, repuxWeb3ServiceSpy, ipfsServiceSpy;

  beforeEach(async () => {
    matDialog = jasmine.createSpyObj('MatDialog', [ 'open' ]);
    dataProductListServiceSpy = jasmine.createSpyObj('DataProductListService', [ 'getDataProducts', 'getBlockchainStateForDataProducts' ]);
    dataProductListServiceSpy.getDataProducts.and.callFake(() => {
      const response = new EsResponse();
      response.hits = [];
      return fromPromise(Promise.resolve(response));
    });
    ipfsServiceSpy = jasmine.createSpyObj('IpfsService', [ 'downloadAndSave' ]);
    repuxWeb3ServiceSpy = jasmine.createSpyObj('RepuxWeb3Service', [ 'isWalletAvailable' ]);

    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceBrowseComponent,
        MarketplaceActionButtonsStubComponent,
        MarketplaceProductCategorySelectorStubComponent,
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
        { provide: IpfsService, useValue: ipfsServiceSpy },
        { provide: RepuxWeb3Service, useValue: repuxWeb3ServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceBrowseComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('#DOM', () => {
    beforeEach(() => {
      const esResponse = new EsResponse<DataProduct>();
      esResponse.hits = [];
      esResponse.total = 0;

      component.products$ = of(esResponse);

      fixture.detectChanges();
    });

    it('should render all elements', () => {
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('.empty-list')).not.toBeNull();
    });
  });
});
