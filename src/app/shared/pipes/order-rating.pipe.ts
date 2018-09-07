import { Pipe, PipeTransform } from '@angular/core';
import { DataProductOrder } from '../models/data-product-order';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'orderRating'
})
export class OrderRatingPipe implements PipeTransform {

  transform(orders: DataProductOrder[]): number {
    return orders
      .reduce((acc, order) => acc.plus(order.rating), new BigNumber(0))
      .div(new BigNumber(orders.length))
      .decimalPlaces(1)
      .toNumber();
  }
}
