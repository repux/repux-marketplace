import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../../app-routing.module';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../components/components.module';
import { SellComponent } from './sell.component';
import { MyActiveListingsComponent } from './my-active-listings/my-active-listings.component';
import { PendingFinalisationComponent } from './pending-finalisation/pending-finalisation.component';
import { UnpublishedComponent } from './unpublished/unpublished.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    MaterialModule,
    ComponentsModule
  ],
  declarations: [
    SellComponent,
    MyActiveListingsComponent,
    PendingFinalisationComponent,
    UnpublishedComponent
  ],
  exports: [
    SellComponent,
    MyActiveListingsComponent,
    PendingFinalisationComponent,
    UnpublishedComponent
  ]
})
export class SellModule {
}
