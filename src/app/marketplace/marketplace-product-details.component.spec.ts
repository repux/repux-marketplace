import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceProductDetailsComponent } from './marketplace-product-details.component';
import { MaterialModule } from '../material.module';
import { CurrencyRepuxPipe } from '../shared/pipes/currency-repux';
import { FileSizePipe } from '../shared/pipes/file-size.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MarketplaceBuyProductButtonComponent } from './marketplace-buy-product-button/marketplace-buy-product-button.component';
import {
  MarketplaceDownloadProductButtonComponent
} from './marketplace-download-product-button/marketplace-download-product-button.component';

describe('MarketplaceProductDetailsComponent', () => {
  let component: MarketplaceProductDetailsComponent;
  let fixture: ComponentFixture<MarketplaceProductDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MarketplaceBuyProductButtonComponent,
        MarketplaceDownloadProductButtonComponent,
        FileSizePipe,
        CurrencyRepuxPipe,
        MarketplaceProductDetailsComponent
      ],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MaterialModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
