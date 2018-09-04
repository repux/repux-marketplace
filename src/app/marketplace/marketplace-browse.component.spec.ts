import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketplaceBrowseComponent } from './marketplace-browse.component';
import { Component, Input } from '@angular/core';
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
import { CurrencyRepuxPipe } from '../shared/pipes/currency-repux.pipe';
import { CategoryOption, SortingOption } from './marketplace-list-filter/marketplace-list-filter.component';
import { ProductCategoryService } from '../services/product-category.service';
import { FormsModule } from '@angular/forms';

@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: ActionButtonType[];
}

@Component({ selector: 'app-marketplace-list-filter', template: '' })
class MarketplaceListFilerStubComponent {
  @Input() isOpened: boolean;
  @Input() categoryOptions: CategoryOption[];
  @Input() sortingOptions: SortingOption[];
}

describe('MarketplaceBrowseComponent', () => {
  const categoriesList = [
    { label: 'category1', isSelected: false },
    { label: 'category2', isSelected: false },
    { label: 'category3', isSelected: false },
    { label: 'category4', isSelected: false },
    { label: 'category5', isSelected: false },
    { label: 'category6', isSelected: false }
  ];

  let component: MarketplaceBrowseComponent;
  let fixture: ComponentFixture<MarketplaceBrowseComponent>;
  let dataProductListServiceSpy, repuxWeb3ServiceSpy, ipfsServiceSpy, projectCategoryServiceStub;

  beforeEach(async () => {
    dataProductListServiceSpy = jasmine.createSpyObj('DataProductListService', [ 'getDataProducts', 'getBlockchainStateForDataProducts' ]);
    dataProductListServiceSpy.getDataProducts.and.callFake(() => {
      const response = new EsResponse();
      response.hits = [];
      return fromPromise(Promise.resolve(response));
    });
    ipfsServiceSpy = jasmine.createSpyObj('IpfsService', [ 'downloadAndSave' ]);
    repuxWeb3ServiceSpy = jasmine.createSpyObj('RepuxWeb3Service', [ 'isWalletAvailable' ]);
    projectCategoryServiceStub = jasmine.createSpyObj('projectCategoryServiceStub', {
      'getFlattenCategories': categoriesList.map(category => category.label)
    });


    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceBrowseComponent,
        MarketplaceActionButtonsStubComponent,
        MarketplaceListFilerStubComponent,
        FileSizePipe,
        EulaTypePipe,
        CurrencyRepuxPipe
      ],
      imports: [
        FormsModule,
        MaterialModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DataProductListService, useValue: dataProductListServiceSpy },
        { provide: IpfsService, useValue: ipfsServiceSpy },
        { provide: RepuxWeb3Service, useValue: repuxWeb3ServiceSpy },
        { provide: ProductCategoryService, useValue: projectCategoryServiceStub }
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

  it('should load flatten categories on initialize', async () => {
    await component.ngOnInit();
    expect(component.categoriesList).toEqual(categoriesList);
  });
});
