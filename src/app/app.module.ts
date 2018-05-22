import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PipesModule } from './pipes/pipes.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataProductListComponent } from './data-product-list/data-product-list.component';
import { ProductCreatorDialogComponent } from './product-creator-dialog/product-creator-dialog.component';
import { ProductCategorySelectorComponent } from './product-category-selector/product-category-selector.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FileInputComponent } from './file-input/file-input.component';
import { TaskManagerComponent } from './task-manager/task-manager.component';
import {
  MatTableModule,
  MatInputModule,
  MatPaginatorModule,
  MatIconModule,
  MatSortModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatDialogModule,
  MatSelectModule,
  MatToolbarModule,
  MatGridListModule,
  MatCardModule,
  MatMenuModule,
  MatTabsModule,
  MatTooltipModule
} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DataProductListComponent,
    ProductCreatorDialogComponent,
    ProductCategorySelectorComponent,
    FileInputComponent,
    TaskManagerComponent
  ],
  entryComponents: [
    ProductCreatorDialogComponent,
    TaskManagerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTabsModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
