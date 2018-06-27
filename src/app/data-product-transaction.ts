import BigNumber from 'bignumber.js';
import { environment } from '../environments/environment';

export class DataProductTransaction {
  finalised: boolean;
  buyerAddress: string;
  buyerMetaHash?: string;
  price: BigNumber;
  publicKey: string;
  purchased: boolean;
  rated: boolean;
  rating: BigNumber;

  deserialize(input: any): DataProductTransaction {
    Object.assign(this, input);
    this.price = (new BigNumber(input.price)).div(Math.pow(10, environment.repux.currency.precision));
    this.rating = new BigNumber(input.rating);
    return this;
  }
}
