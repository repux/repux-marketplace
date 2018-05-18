import { NgModule } from '@angular/core';

import { ArrayJoinPipe } from './array-join.pipe';
import { FileSizePipe } from "./file-size.pipe";

@NgModule({
  declarations: [
    ArrayJoinPipe,
    FileSizePipe
  ],
  exports: [
    ArrayJoinPipe,
    FileSizePipe
  ]
})
export class PipesModule {
}
