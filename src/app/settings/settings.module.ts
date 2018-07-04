import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsIndexComponent } from './settings-index/settings-index.component';
import { MatButtonModule } from '@angular/material';
import { KeyStoreModule } from '../key-store/key-store.module';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    KeyStoreModule
  ],
  declarations: [ SettingsIndexComponent ]
})
export class SettingsModule {
}
