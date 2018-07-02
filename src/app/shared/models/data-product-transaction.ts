import BigNumber from 'bignumber.js';
import { environment } from '../../../environments/environment';

export class DataProductTransaction {
  finalised: boolean;
  buyerAddress: string;
  buyerMetaHash?: string;
  price: BigNumber;
  publicKey: string;
  purchased: boolean;
  rated: boolean;
  rating: BigNumber;
  deliveryDeadline: Date;

  deserialize(input: any): DataProductTransaction {
    Object.assign(this, input);
    this.price = (new BigNumber(input.price)).div(Math.pow(10, environment.repux.currency.precision));
    this.rating = new BigNumber(input.rating);
    this.deliveryDeadline = new Date(input.deliveryDeadline * 1000);
    return this;
  }
}
