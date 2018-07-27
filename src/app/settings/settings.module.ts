import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsIndexComponent } from './settings-index/settings-index.component';
import { KeyStoreModule } from '../key-store/key-store.module';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    KeyStoreModule
  ],
  declarations: [ SettingsIndexComponent ]
})
export class SettingsModule {
}
