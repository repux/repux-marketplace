import { TestBed } from '@angular/core/testing';
import { WalletService, WalletServiceFactory } from './wallet.service';

const balanceInWei = 1000000000000000000;
const balanceInEther = 1;

const web3Mock = {
  eth: {
    accounts: [ '0x7300Ff23F38D44F2E3142feEE8Db36960EEB0571' ],
  },
  fromWei() {
    return balanceInEther;
  },
  currentProvider: {
    send() {
    },
    sendAsync() {
    }
  }
};

const repuxWeb3ApiMock = {
  getDefaultAccount() {
    return web3Mock.eth.accounts[ 0 ];
  },

  async getBalance() {
    return balanceInWei;
  }
};

const WalletServiceFactoryMock = () => {
  return new WalletService(web3Mock, repuxWeb3ApiMock);
};

let walletService;
let walletServiceNoWeb3;

describe('WalletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ {
        provide: WalletService,
        useFactory: WalletServiceFactoryMock
      } ]
    });

    walletService = TestBed.get(WalletService);
  });

  it('should be created', () => {
    expect(walletService).toBeTruthy();
  });

  describe('isProviderAvailable()', () => {
    it('should return true if wallet provider is available', () => {
      expect(walletService.isProviderAvailable()).toBeTruthy();
    });

    it('should return false when wallet provider is not set', () => {
      walletServiceNoWeb3 = WalletServiceFactory();
      expect(walletServiceNoWeb3.isProviderAvailable()).toBeFalsy();
    });
  });

  describe('isDefaultAccountAvailable()', () => {
    it('should return true if wallet account is available', () => {
      expect(walletService.isDefaultAccountAvailable()).toBeTruthy();
    });

    it('should return false when wallet account is not available', () => {
      walletServiceNoWeb3 = WalletServiceFactory();
      expect(walletServiceNoWeb3.isDefaultAccountAvailable()).toBeFalsy();
    });
  });

  describe('getData()', () => {
    it('should return wallet data with account number and balance set', async () => {
      const wallet = await walletService.getData();
      expect(wallet.address).toEqual(web3Mock.eth.accounts[ 0 ]);
      expect(wallet.balance).toEqual(balanceInEther);
    });

    it('should return null when no provider available', async () => {
      walletServiceNoWeb3 = WalletServiceFactory();
      const wallet = await walletServiceNoWeb3.getData();
      expect(wallet).toBeNull();
    });
  });
});
