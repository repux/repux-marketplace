export class EthereumWallet {
  address: string;
  balance: number;

  constructor(_address: string, _balance: number) {
    this.address = _address;
    this.balance = _balance;
  }
}
