import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { MarketplaceComponent } from './marketplace.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { SharedModule } from '../shared/shared.module';
import { BuyingModule } from './buying/buying.module';
import { SellModule } from './sell/sell.module';
import { ComponentsModule } from './components/components.module';
import { KeyStoreModule } from '../key-store/key-store.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    BuyingModule,
    SellModule,
    ComponentsModule,
    KeyStoreModule
  ],
  declarations: [
    MarketplaceComponent,
    ProductDetailsComponent
  ],
  exports: [
    MarketplaceComponent,
    ProductDetailsComponent
  ],
})
export class MarketplaceModule {
}
