import BigNumber from 'bignumber.js';
import { environment } from '../../../environments/environment';

export class DataProductOrder {
  dataProductAddress: string;
  finalised: boolean;
  buyerAddress: string;
  buyerMetaHash?: string;
  price: BigNumber;
  publicKey: string;
  purchased: boolean;
  rated: boolean;
  rating: BigNumber;
  deliveryDeadline: Date;
  rateDeadline: Date;

  deserialize(input: any): DataProductOrder {
    Object.assign(this, input);
    this.price = (new BigNumber(input.price)).div(Math.pow(10, environment.repux.currency.precision));
    this.rating = new BigNumber(input.rating);
    this.deliveryDeadline = new Date(input.deliveryDeadline * 1000);
    this.rateDeadline = new Date(input.rateDeadline * 1000);
    return this;
  }
}
