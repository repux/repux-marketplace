import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PipesModule } from './pipes/pipes.module';

import { AppComponent } from './app.component';
import { DataProductListComponent } from './data-product-list/data-product-list.component';
import { FileSizeComponent } from './file-size/file-size.component';
import { CurrencyComponent } from './currency/currency.component';

@NgModule({
  declarations: [
    AppComponent,
    DataProductListComponent,
    FileSizeComponent,
    CurrencyComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    MatIconModule,
    MatSortModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    PipesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
