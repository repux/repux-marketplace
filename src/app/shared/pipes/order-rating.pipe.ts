import { Pipe, PipeTransform } from '@angular/core';
import { DataProductOrder } from '../models/data-product-order';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'orderRating'
})
export class OrderRatingPipe implements PipeTransform {

  transform(orders: DataProductOrder[]): number {
    const ratingsCount = orders.filter(order => order.rating.comparedTo(0)).length;

    if (ratingsCount === 0) {
      return 0;
    }

    return orders
      .filter(order => order.rating.comparedTo(0))
      .reduce((acc, order) => acc.plus(order.rating), new BigNumber(0))
      .div(new BigNumber(ratingsCount))
      .decimalPlaces(1)
      .toNumber();
  }
}
