import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderDate'
})
export class OrderDatePipe implements PipeTransform {
  transform(value: Date, daysToDeliver: number): any {
    return new Date(value.getTime() - daysToDeliver * 24 * 60 * 60 * 1000);
  }
}
