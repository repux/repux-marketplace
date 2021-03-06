import { RepuxLibService } from './repux-lib.service';
import { RepuxLib } from '@repux/repux-lib';

describe('RepuxLibService', () => {
  let repuxLibService, ipfsServiceSpy;
  const ipfsInstanceMock = 'IPFS_INSTANCE';

  beforeEach(() => {
    ipfsServiceSpy = jasmine.createSpyObj(
      'IpfsService',
      [ 'getInstance' ]
    );
    ipfsServiceSpy.getInstance.and.returnValue(ipfsInstanceMock);
    repuxLibService = new RepuxLibService(<any> ipfsServiceSpy);
  });

  describe('#getInstance()', () => {
    it('should return RepuxLib instance', () => {
      expect(repuxLibService.getInstance()[ 'ipfs' ]).toBe(ipfsInstanceMock);
      expect(repuxLibService.getInstance() instanceof RepuxLib).toBeTruthy();
    });
  });
});
