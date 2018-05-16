import { NgModule } from '@angular/core';

import { ArrayJoinPipe } from './array-join.pipe';

@NgModule({
  declarations: [
    ArrayJoinPipe
  ],
  exports: [
    ArrayJoinPipe
  ]
})
export class PipesModule {
}
