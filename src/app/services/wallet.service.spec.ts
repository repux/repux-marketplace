import { MetamaskStatus, WalletService } from './wallet.service';
import Wallet from '../shared/models/wallet';
import BigNumber from 'bignumber.js';

const balanceInEther = 1;

const web3Mock = {
  eth: {
    accounts: [ '0x7300Ff23F38D44F2E3142feEE8Db36960EEB0571' ],
  },
  currentProvider: {
    send() {
    },
    sendAsync() {
    }
  }
};

const repuxWeb3ApiMock = {
  async getDefaultAccount() {
    return web3Mock.eth.accounts[ 0 ];
  },

  async getBalance() {
    return new BigNumber(balanceInEther);
  }
};

let walletService;
let repuxWeb3ServiceSpy;
let clockServiceSpy;

describe('WalletService', () => {
  beforeEach(() => {
    repuxWeb3ServiceSpy = jasmine.createSpyObj(
      'RepuxWeb3Service',
      [ 'getRepuxApiInstance', 'getWeb3Instance', 'isProviderAvailable', 'isDefaultAccountAvailable', 'isNetworkCorrect' ]
    );
    clockServiceSpy = jasmine.createSpyObj('ClockService', [ 'onEachMinute' ]);
    clockServiceSpy.onEachMinute.and.returnValue({
      subscribe() {
      }
    });
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = undefined;
    walletService = new WalletService(<any> repuxWeb3ServiceSpy, <any> clockServiceSpy);
    window.requestAnimationFrame = raf;
  });

  it('should be created', () => {
    expect(walletService).toBeTruthy();
  });

  describe('#detect()', () => {
    it('should return `wrong network`', async () => {
      repuxWeb3ServiceSpy.isProviderAvailable.and.returnValue(true);
      repuxWeb3ServiceSpy.isNetworkCorrect.and.returnValue(false);
      expect(await walletService.detectMetamaskStatus()).toEqual(MetamaskStatus.WrongNetwork);
    });

    it('should return `not installed`', async () => {
      repuxWeb3ServiceSpy.isProviderAvailable.and.returnValue(false);
      expect(await walletService.detectMetamaskStatus()).toEqual(MetamaskStatus.NotInstalled);
    });

    it('should return `not logged in`', async () => {
      repuxWeb3ServiceSpy.isNetworkCorrect.and.returnValue(true);
      repuxWeb3ServiceSpy.isProviderAvailable.and.returnValue(true);
      repuxWeb3ServiceSpy.isDefaultAccountAvailable.and.returnValue(false);
      expect(await walletService.detectMetamaskStatus()).toEqual(MetamaskStatus.NotLoggedIn);
    });

    it('should return `ok`', async () => {
      repuxWeb3ServiceSpy.isNetworkCorrect.and.returnValue(true);
      repuxWeb3ServiceSpy.isProviderAvailable.and.returnValue(true);
      repuxWeb3ServiceSpy.isDefaultAccountAvailable.and.returnValue(true);
      expect(await walletService.detectMetamaskStatus()).toEqual(MetamaskStatus.Ok);
    });
  });

  describe('#getWalletData()', () => {
    it('should return wallet data with account number and balance set', async () => {
      repuxWeb3ServiceSpy.isDefaultAccountAvailable.and.returnValue(true);
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue(repuxWeb3ApiMock);
      const wallet = await walletService.getWalletData();
      expect(wallet.address).toEqual(web3Mock.eth.accounts[ 0 ]);
      expect(wallet.balance).toEqual(new BigNumber(balanceInEther));
      expect(repuxWeb3ServiceSpy.getRepuxApiInstance.calls.count()).toBe(1);
    });
  });

  describe('#updateBalance()', () => {
    it('should update current wallet balance', async () => {
      repuxWeb3ServiceSpy.isDefaultAccountAvailable.and.returnValue(true);
      repuxWeb3ServiceSpy.getRepuxApiInstance.and.returnValue(repuxWeb3ApiMock);
      walletService[ 'walletSubject' ].next(new Wallet(web3Mock.eth.accounts[ 0 ], new BigNumber(3)));

      await walletService.updateBalance();

      expect(walletService[ 'balanceSubject' ].getValue()).toEqual(new BigNumber(balanceInEther));
    });
  });
});
