import { BigNumber } from 'bignumber.js';
import { Deserializable } from './deserializable';
import { environment } from '../../../environments/environment';
import { DataProductOrder } from './data-product-order';
import { DataProduct as BlockchainDataProduct } from 'repux-web3-api';
import { Eula, Attachment } from 'repux-lib';

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
  orders: DataProductOrder[] = [];
  lastUpdate: Date;
  daysToDeliver: number;
  daysToRate: number;
  fundsToWithdraw: BigNumber;
  blockchainState?: BlockchainDataProduct;
  eula: Eula;
  sampleFile: Attachment[];

  deserialize(input: any): DataProduct {
    Object.assign(this, input);
    this.price = (new BigNumber(input.price)).div(Math.pow(10, environment.repux.currency.precision));
    this.fundsToWithdraw = (new BigNumber(input.fundsToWithdraw)).div(Math.pow(10, environment.repux.currency.precision));
    this.lastUpdate = new Date(input.lastUpdateTimestamp);

    this.orders = [];
    if (input.orders) {
      input.orders.forEach(orderInput => {
        const order = new DataProductOrder();
        order.dataProductAddress = this.address;
        order.deserialize(orderInput);
        this.orders.push(order);
      });
    }

    return this;
  }
}
