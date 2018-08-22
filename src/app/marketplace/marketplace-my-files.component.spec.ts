import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceMyFilesComponent } from './marketplace-my-files.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../material.module';
import { MyActiveListingsService } from './services/my-active-listings.service';
import { BehaviorSubject } from 'rxjs';
import { DataProduct } from '../shared/models/data-product';
import { ReadyToDownloadService } from './services/ready-to-download.service';

describe('MarketplaceMyFilesComponent', () => {
  let component: MarketplaceMyFilesComponent;
  let fixture: ComponentFixture<MarketplaceMyFilesComponent>;

  beforeEach(async(() => {
    const dataProduct = new DataProduct();
    const myActiveListingsServiceSpy = jasmine.createSpyObj('MyActiveListingsService', [ 'getProducts' ]);
    myActiveListingsServiceSpy.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ dataProduct ]));

    const readyToDownloadServiceSpy = jasmine.createSpyObj('ReadyToDownloadService', [ 'getProducts' ]);
    readyToDownloadServiceSpy.getProducts.and.returnValue(new BehaviorSubject<DataProduct[]>([ dataProduct ]));

    TestBed.configureTestingModule({
      declarations: [ MarketplaceMyFilesComponent ],
      imports: [
        RouterTestingModule,
        MaterialModule
      ],
      providers: [
        { provide: MyActiveListingsService, useValue: myActiveListingsServiceSpy },
        { provide: ReadyToDownloadService, useValue: readyToDownloadServiceSpy }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceMyFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
