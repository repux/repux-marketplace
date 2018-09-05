import { Pipe, PipeTransform } from '@angular/core';
import { EulaType } from 'repux-lib';

@Pipe({
  name: 'eulaType'
})
export class EulaTypePipe implements PipeTransform {
  transform(value: EulaType): string {
    const eulaTypeString = value.toString().toLowerCase();
    return eulaTypeString.charAt(0).toUpperCase() + eulaTypeString.slice(1);
  }
}
