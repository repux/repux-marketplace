import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceProductDetailsComponent } from './marketplace-product-details.component';
import { MaterialModule } from '../material.module';
import { CurrencyRepuxPipe } from '../shared/pipes/currency-repux';
import { FileSizePipe } from '../shared/pipes/file-size.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { DataProduct } from '../shared/models/data-product';

@Component({ selector: 'app-marketplace-action-buttons', template: '' })
class MarketplaceActionButtonsStubComponent {
  @Input() dataProduct: DataProduct;
  @Input() availableActions: string[];
}

describe('MarketplaceProductDetailsComponent', () => {
  let component: MarketplaceProductDetailsComponent;
  let fixture: ComponentFixture<MarketplaceProductDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MarketplaceActionButtonsStubComponent,
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
