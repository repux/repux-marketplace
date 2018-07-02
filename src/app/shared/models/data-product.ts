import { BigNumber } from 'bignumber.js';
import { Deserializable } from './deserializable';
import { environment } from '../../../environments/environment';
import { DataProductTransaction } from './data-product-transaction';

export class DataProduct implements Deserializable<DataProduct> {
  address?: string;
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  type?: string;
  category?: string[];
  maxNumberOfDownloads?: number;
  price?: BigNumber;
  sellerMetaHash?: string;
  termsOfUseType?: string;
  name?: string;
  size?: number;
  ownerAddress?: string;
  purchased?: string[];
  finalised?: string[];
  disabled?: boolean;
  transactions: DataProductTransaction[] = [];
  lastUpdate: Date;
  daysForDeliver: number;
  fundsToWithdraw: BigNumber;

  deserialize(input: any): DataProduct {
    Object.assign(this, input);
    this.price = (new BigNumber(input.price)).div(Math.pow(10, environment.repux.currency.precision));
    this.fundsToWithdraw = (new BigNumber(input.fundsToWithdraw)).div(Math.pow(10, environment.repux.currency.precision));
    this.lastUpdate = new Date(input.lastUpdateTimestamp);

    this.transactions = [];
    if (input.transactions) {
      input.transactions.forEach(transactionInput => {
        const transaction = new DataProductTransaction();
        transaction.deserialize(transactionInput);
        this.transactions.push(transaction);
      });
    }

    return this;
  }
}
