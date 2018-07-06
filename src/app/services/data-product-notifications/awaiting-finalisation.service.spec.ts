import { DataProductUpdateAction } from 'repux-web3-api';
import { Notification } from '../../notifications/notification';
import { NotificationType } from '../../notifications/notification-type';
import { BigNumber } from 'bignumber.js';
import { AwaitingFinalisationService } from './awaiting-finalisation.service';

describe('AwaitingFinalisationService', () => {
  let service: AwaitingFinalisationService;
  let dataProductServiceSpy, notificationsServiceSpy;
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

    service = new AwaitingFinalisationService(dataProductServiceSpy, notificationsServiceSpy);
  });

  describe('#parse()', () => {
    it('should return correct notification message when transaction is finalised', async () => {
      dataProductServiceSpy.getTransactionData.and.returnValue({
        publicKey: 'PUBLIC_KEY',
        buyerMetaHash: 'BUYER_META_HASH',
        price: new BigNumber(1),
        purchased: true,
        finalised: true,
        rated: false,
        rating: new BigNumber(0)
      });
      const purchaseEvent = {
        dataProductAddress,
        userAddress,
        dataProductUpdateAction: DataProductUpdateAction.PURCHASE,
        blockNumber: 1
      };
      const notification = new Notification(NotificationType.DATA_PRODUCT_PURCHASED, {
        purchaseEvent
      });

      const result = await service.parse(notification);

      expect(notification.read).toBeTruthy();
      expect(result).toBe(`You have purchased product ${dataProductAddress} Please wait to transaction finalisation.`);
    });
  });
});




