import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'array_join'
})
export class ArrayJoinPipe implements PipeTransform {

  transform(input: any, character: string = ''): any {

    if (!Array.isArray(input)) {
      return input;
    }

    return input.join(character);
  }
}
