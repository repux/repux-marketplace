import { TestBed } from '@angular/core/testing';
import { RepuxWeb3Service, RepuxWeb3ServiceFactory } from './repux-web3.service';
import RepuxWeb3Api from 'repux-web3-api/repux-web3-api';

const balanceInWei = 1000000000000000000;
const balanceInEther = 1;

const web3Mock = {
  eth: {
    accounts: [ '0x7300Ff23F38D44F2E3142feEE8Db36960EEB0571' ],
    getAccounts(callback) {
      callback(null, this.accounts);
    }
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
    return new Promise(resolve => {
      web3Mock.eth.getAccounts((error, accounts) => {
        resolve(accounts);
      });
    });
  },

  async getBalance() {
    return balanceInWei;
  }
};

const RepuxWeb3ServiceFactoryMock = () => {
  return new RepuxWeb3Service(web3Mock, repuxWeb3ApiMock);
};

let repuxWeb3Service;
let repuxWeb3ServiceNoWeb3;

describe('RepuxWeb3Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ {
        provide: RepuxWeb3Service,
        useFactory: RepuxWeb3ServiceFactoryMock
      } ]
    });

    repuxWeb3Service = TestBed.get(RepuxWeb3Service);
  });

  it('should be created', () => {
    expect(repuxWeb3Service).toBeTruthy();
  });

  describe('#isProviderAvailable()', () => {
    it('should return true if web3 provider is available', () => {
      expect(repuxWeb3Service.isProviderAvailable()).toBeTruthy();
    });

    it('should return false when web3 provider is not set', async () => {
      repuxWeb3ServiceNoWeb3 = await RepuxWeb3ServiceFactory();
      expect(repuxWeb3ServiceNoWeb3.isProviderAvailable()).toBeFalsy();
    });
  });

  describe('#isDefaultAccountAvailable()', () => {
    it('should return true if account is available', async () => {
      expect(await repuxWeb3Service.isDefaultAccountAvailable()).toBeTruthy();
    });

    it('should return false when account is not available', async () => {
      repuxWeb3ServiceNoWeb3 = await RepuxWeb3ServiceFactory();
      expect(await repuxWeb3ServiceNoWeb3.isDefaultAccountAvailable()).toBeFalsy();
    });
  });

  describe('#getWeb3Instance()', () => {
    it('should return web3 instance', () => {
      const service = new RepuxWeb3Service('Web3', 'RepuxWeb3Api');
      expect(service.getWeb3Instance()).toBe('Web3');
    });
  });

  describe('#getRepuxApiInstance()', () => {
    it('should return web3 instance', async () => {
      const service = new RepuxWeb3Service('Web3', 'RepuxWeb3Api');
      expect(await service.getRepuxApiInstance()).toBe('RepuxWeb3Api');
    });
  });
});
