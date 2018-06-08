import { WalletService } from './wallet.service';

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
    return web3Mock.eth.accounts[0];
  },

  async getBalance() {
    return balanceInWei;
  }
};

let walletService;
let repuxWeb3ServiceSpy;

describe('WalletService', () => {
  beforeEach(() => {
    repuxWeb3ServiceSpy = jasmine.createSpyObj(
      'RepuxWeb3Service',
      [ 'getRepuxApiInstance', 'getWeb3Instance', 'isProviderAvailable', 'isDefaultAccountAvailable' ]
    );
    walletService = new WalletService(<any> repuxWeb3ServiceSpy);
  });

  it('should be created', () => {
    expect(walletService).toBeTruthy();
  });

  describe('isProviderAvailable()', () => {
    it('should return call isProviderAvailable on repuxWeb3Service', () => {
      repuxWeb3ServiceSpy.isProviderAvailable.and.returnValue(true);
      expect(walletService.isProviderAvailable()).toBeTruthy();
      expect(repuxWeb3ServiceSpy.isProviderAvailable.calls.count()).toBe(1);
    });
  });

  describe('isDefaultAccountAvailable()', () => {
    it('should return call isDefaultAccountAvailable on repuxWeb3Service', async () => {
      repuxWeb3ServiceSpy.isDefaultAccountAvailable.and.returnValue(Promise.resolve(true));
      expect(await walletService.isDefaultAccountAvailable()).toBeTruthy();
      expect(repuxWeb3ServiceSpy.isDefaultAccountAvailable.calls.count()).toBe(1);
    });
  });

  describe('getData()', () => {
    it('should return wallet data with account number and balance set', async () => {
      repuxWeb3ServiceSpy.isDefaultAccountAvailable.and.returnValue(Promise.resolve(true));
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue(repuxWeb3ApiMock);
      repuxWeb3ServiceSpy.getWeb3Instance.and.returnValue(web3Mock);
      const wallet = await walletService.getData();
      expect(wallet.address).toEqual(web3Mock.eth.accounts[ 0 ]);
      expect(wallet.balance).toEqual(balanceInEther);
      expect(repuxWeb3ServiceSpy.getWeb3Instance.calls.count()).toBe(1);
      expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(2);
    });

    it('should return null when no provider available', async () => {
      repuxWeb3ServiceSpy.isDefaultAccountAvailable.and.returnValue(Promise.resolve(false));
      const wallet = await walletService.getData();
      expect(wallet).toBeNull();
    });
  });
});
