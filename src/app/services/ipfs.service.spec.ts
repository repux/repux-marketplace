import { IpfsService } from './ipfs.service';
import { environment } from '../../environments/environment';

describe('IpfsService', () => {
  let ipfsService;

  beforeEach(() => {
    window.IpfsApi = function (config) {
      this.config = config;
    };
    ipfsService = new IpfsService();
  });

  describe('#getInstance()', () => {
    it('should return IpfsApi instance', () => {
      expect(ipfsService.getInstance().config).toBe(environment.ipfs);
      expect(ipfsService.getInstance() instanceof window.IpfsApi).toBeTruthy();
    });
  });
});
