import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsIndexComponent } from './settings-index/settings-index.component';
import { MatButtonModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule
  ],
  declarations: [ SettingsIndexComponent ]
})
export class SettingsModule {
}
