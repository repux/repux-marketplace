import { NgModule } from '@angular/core';
import { BuyingComponent } from './buying.component';
import { AwaitingFinalisationComponent } from './awaiting-finalisation/awaiting-finalisation.component';
import { ReadyToDownloadComponent } from './ready-to-download/ready-to-download.component';
import { AppRoutingModule } from '../../app-routing.module';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    MaterialModule,
    ComponentsModule
  ],
  declarations: [
    BuyingComponent,
    AwaitingFinalisationComponent,
    ReadyToDownloadComponent
  ],
  exports: [
    BuyingComponent,
    AwaitingFinalisationComponent,
    ReadyToDownloadComponent
  ]
})
export class BuyingModule {
}
