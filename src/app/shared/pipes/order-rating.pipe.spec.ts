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
    order2.rating = new BigNumber(3);
    const order3 = new DataProductOrder();
    order3.rating = new BigNumber(4);

    product.orders = [].concat([ order1, order2, order3 ]);
    const pipe = new OrderRatingPipe();
    expect(pipe.transform(product.orders)).toEqual(2.7);
  });
});
