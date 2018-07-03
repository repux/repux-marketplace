import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsComponent } from './product-details.component';
import { MaterialModule } from '../../material.module';
import { BuyProductButtonComponent } from '../components/buy-product-button/buy-product-button.component';
import { DownloadProductButtonComponent } from '../components/download-product-button/download-product-button.component';
import { CurrencyRepuxPipe } from '../../shared/pipes/currency-repux';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BuyProductButtonComponent,
        DownloadProductButtonComponent,
        FileSizePipe,
        CurrencyRepuxPipe,
        ProductDetailsComponent
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
    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
