import BigNumber from 'bignumber.js';

export default class Wallet {
  address: string;
  balance: BigNumber;

  constructor(address: string, balance: BigNumber) {
    this.address = address;
    this.balance = balance;
  }
}
