import BigNumber from 'bignumber.js';
import { Deserializable } from './deserializable';

export class User implements Deserializable<User> {
  address?: string;
  sellerRating?: BigNumber;

  deserialize(input: any): User {
    Object.assign(this, input);
    this.sellerRating = new BigNumber(input.sellerRating);

    return this;
  }
}
