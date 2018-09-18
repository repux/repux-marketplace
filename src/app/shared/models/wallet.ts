import BigNumber from 'bignumber.js';

export default class Wallet {
  address: string;
  balance: BigNumber;
  ethBalance: BigNumber;

  constructor(address: string, balance: BigNumber, ethBalance: BigNumber) {
    this.address = address;
    this.balance = balance;
    this.ethBalance = ethBalance;
  }
}
