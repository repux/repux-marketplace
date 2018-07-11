import { DataProductUpdateAction } from 'repux-web3-api';
import { Notification } from '../../notifications/notification';
import { NotificationType } from '../../notifications/notification-type';
import { ReadyToDownloadService } from './ready-to-download.service';
import Wallet from '../../shared/models/wallet';

describe('ReadyToDownloadService', () => {
  let service: ReadyToDownloadService;
  let dataProductServiceSpy, notificationsServiceSpy, awaitingFinalisationServiceSpy, pendingFinalisationServiceSpy;
  const dataProductAddress = '0x00';
  const userAddress = '0x11';

  beforeEach(() => {
    dataProductServiceSpy = jasmine.createSpyObj(
      'DataProductService',
      [ 'getTransactionData' ]
    );

    notificationsServiceSpy = jasmine.createSpyObj(
      'NotificationsServiceSpy',
      [ 'saveNotifications' ]
    );
    notificationsServiceSpy.wallet = new Wallet(userAddress, 0);

    awaitingFinalisationServiceSpy = jasmine.createSpyObj(
      'AwaitingFinalisationServiceSpy',
      [ 'remove' ]
    );

    pendingFinalisationServiceSpy = jasmine.createSpyObj(
      'PendingFinalisationServiceSpy',
      [ 'remove' ]
    );

    service = new ReadyToDownloadService(
      dataProductServiceSpy,
      notificationsServiceSpy,
      awaitingFinalisationServiceSpy,
      pendingFinalisationServiceSpy
    );
  });

  describe('#parse()', () => {
    it('should return correct notification message when userAddress is different than current user account', async () => {
      const finaliseEvent = {
        dataProductAddress,
        userAddress: '0x01',
        dataProductUpdateAction: DataProductUpdateAction.PURCHASE,
        blockNumber: 1
      };

      const notification = new Notification(NotificationType.DATA_PRODUCT_TO_FINALISATION, {
        finaliseEvent
      });

      const result = await service.parse(notification);

      expect(result).toBe(`Your have finalised purchase for your product ${dataProductAddress}.`);
      expect(awaitingFinalisationServiceSpy.remove.calls.count()).toBe(1);
      expect(pendingFinalisationServiceSpy.remove.calls.count()).toBe(1);
    });

    it('should return correct notification message when userAddress is equal to current user account', async () => {
      const finaliseEvent = {
        dataProductAddress,
        userAddress,
        dataProductUpdateAction: DataProductUpdateAction.PURCHASE,
        blockNumber: 1
      };

      const notification = new Notification(NotificationType.DATA_PRODUCT_TO_FINALISATION, {
        finaliseEvent
      });

      const result = await service.parse(notification);

      expect(result).toBe(`Your purchase for product ${dataProductAddress} is finalised.`);
      expect(awaitingFinalisationServiceSpy.remove.calls.count()).toBe(1);
      expect(pendingFinalisationServiceSpy.remove.calls.count()).toBe(1);
    });
  });
});
