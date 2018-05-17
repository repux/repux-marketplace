import { TestBed, inject } from '@angular/core/testing';

import { Web3Service } from './web3.service';

const web3Mock = {
  eth: {
    coinbase: '0x7300Ff23F38D44F2E3142feEE8Db36960EEB0571',
    getBalance(address: string, callback: any) {
      expect(address).toEqual(this.coinbase);
      callback(null, 100);
    }
  },
  fromWei() {
    return 100;
  }
};

class MockWeb3Service extends Web3Service {
  constructor() {
    super();
    this.setWeb3(web3Mock);
  }
}

describe('Web3Service', () => {
  let mockWeb3Service: Web3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ Web3Service, MockWeb3Service ]
    });

    mockWeb3Service = TestBed.get(MockWeb3Service);
  });

  it('should be created', () => {
    expect(mockWeb3Service).toBeTruthy();
  });

  describe('isWeb3Present', () => {
    it('should detect web3 presence in a global scope', () => {
      expect(mockWeb3Service.isWeb3Present()).toBeTruthy();
    });
  });

  describe('isCoinbaseAvailable', () => {
    it('should check if coinbase account is present', () => {
      expect(mockWeb3Service.isCoinbaseAvailable()).toBeTruthy();
    });
  });

  describe('getWallet', () => {
    it('should reject promise if no web3 available', (done) => {
      inject([ Web3Service ], (web3Service: Web3Service) => {
        web3Service.getWallet().catch((reason) => {
          expect(reason).toEqual('Wallet unavailable');
          done();
        });
      })();
    });

    it('should return wallet with address and balance set', (done) => {
      mockWeb3Service.getWallet().then((wallet) => {
        expect(wallet.address).toEqual(web3Mock.eth.coinbase);
        expect(wallet.balance).toEqual(100);
        done();
      });
    });
  });

});
