import { OrderRatingPipe } from './order-rating.pipe';
import { DataProduct } from '../models/data-product';
import { DataProductOrder } from '../models/data-product-order';
import BigNumber from 'bignumber.js';

describe('OrderRatingPipe', () => {
  it('should return arithmetic average value of orders rating', () => {
    const product = new DataProduct();

    const order1 = new DataProductOrder();
    order1.rating = new BigNumber(1);

    const order2 = new DataProductOrder();
    order2.rating = new BigNumber(2);

    const order3 = new DataProductOrder();
    order3.rating = new BigNumber(3);

    const order4 = new DataProductOrder();
    order4.rating = new BigNumber(4);

    const orderNoRating = new DataProductOrder();
    orderNoRating.rating = new BigNumber(0);

    product.orders = [].concat([ order1, order2, order4 ]);
    const pipe = new OrderRatingPipe();
    expect(pipe.transform(product.orders)).toEqual(2.3);

    product.orders = [];
    expect(pipe.transform(product.orders)).toEqual(0);

    product.orders = [orderNoRating];
    expect(pipe.transform(product.orders)).toEqual(0);

    product.orders = [order1, orderNoRating, order3];
    expect(pipe.transform(product.orders)).toEqual(2);

    product.orders = [order1, order3, order4, orderNoRating];
    expect(pipe.transform(product.orders)).toEqual(2.7);
  });
});
