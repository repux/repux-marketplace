import { BigNumber } from 'bignumber.js';
import { Deserializable } from './deserializable';
import { environment } from '../environments/environment';

export class DataProduct implements Deserializable<DataProduct> {
  title: string;
  shortDescription: string;
  fullDescription: string;
  type: string;
  category: string[];
  maxNumberOfDownloads: number;
  price: BigNumber;
  termsOfUseType: string;
  name: string;
  size: number;

  deserialize(input: any): DataProduct {
    Object.assign(this, input);
    this.price = (new BigNumber(input.price)).div(Math.pow(10, environment.repux.currency.precision));
    return this;
  }
}
