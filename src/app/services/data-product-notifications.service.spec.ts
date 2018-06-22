import { DataProductNotificationsService } from './data-product-notifications.service';
import { DataProductService } from './data-product.service';
import { RepuxLibService } from './repux-lib.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MatDialog } from '@angular/material';
import { KeyStoreService } from '../key-store/key-store.service';
import { TaskManagerService } from './task-manager.service';
import { NotificationType } from '../notifications/notification-type';
import { DataProductUpdateAction } from 'repux-web3-api';
import { Notification } from '../notifications/notification';
import BigNumber from 'bignumber.js';
import Wallet from '../wallet';

describe('DataProductNotificationsService', () => {
  let service: DataProductNotificationsService;
  let notificationsService, repuxLibService, dataProductService, keyStoreService, taskManagerService, matDialog,
    walletService;
  const productAddress = '0x1111111111111111111111111111111111111111';
  const walletAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(() => {
    notificationsService = jasmine.createSpyObj(
      'NotificationsService',
      [ 'addParser', 'pushNotification', 'saveNotifications' ]
    );
    repuxLibService = jasmine.createSpyObj(
      'RepuxLibService',
      [ 'getClass', 'getInstance' ]
    );
    dataProductService = jasmine.createSpyObj(
      'DataProductService',
      [ 'getCreatedDataProducts', 'watchForDataProductUpdate', 'getDataProductData', 'getTransactionData' ]
    );
    keyStoreService = jasmine.createSpyObj(
      'KeyStoreService',
      [ 'hasKeys' ]
    );
    taskManagerService = jasmine.createSpyObj(
      'TaskManagerService',
      [ 'addTask' ]
    );
    matDialog = jasmine.createSpyObj(
      'MatDialog',
      [ 'open' ]
    );
    walletService = jasmine.createSpyObj(
      'WalletService',
      [ 'getWallet' ]
    );
    const wallet = new Wallet(walletAddress, 1);
    walletService.getWallet.and.returnValue({
      subscribe(callback) {
        callback(wallet);
      }
    });
    dataProductService.getCreatedDataProducts.and.returnValue(Promise.resolve([]));

    service = new DataProductNotificationsService(
      notificationsService,
      dataProductService,
      walletService
    );
  });

  describe('#constructor()', () => {
    it('should add parser to notificationsService', () => {
      expect(notificationsService.addParser.calls.count()).toBe(1);
      expect(notificationsService.addParser.calls.allArgs()[ 0 ][ 0 ]).toBe(NotificationType.DATA_PRODUCT_TO_FINALISATION);
      expect(typeof notificationsService.addParser.calls.allArgs()[ 0 ][ 1 ]).toBe('function');
      expect(dataProductService.getCreatedDataProducts.calls.count()).toBe(1);
    });
  });

  describe('#_init()', () => {
    it('should create watchers for all products created by user', async () => {
      dataProductService.getCreatedDataProducts.and.returnValue(Promise.resolve([ productAddress ]));
      const watchForProductPurchase = jasmine.createSpy();
      service[ 'watchForProductPurchase' ] = watchForProductPurchase;

      await service[ '_init' ]();
      expect(watchForProductPurchase.calls.count()).toBe(1);
      expect(watchForProductPurchase.calls.allArgs()[ 0 ][ 0 ]).toBe(productAddress);
    });
  });

  describe('#watchForProductPurchase()', () => {
    it('should call _dataProductService.watchForDataProductUpdate and push subscription to _purchaseSubscriptions array', () => {
      const expectedResult = {
        unsubscribe: jasmine.createSpy()
      };
      const subscriptionCallbackResult = {
        buyerAddress: '0x11'
      };
      const subscribe = jasmine.createSpy();
      const onProductPurchase = jasmine.createSpy();
      subscribe.and.returnValue(expectedResult);
      dataProductService.watchForDataProductUpdate.and.returnValue({ subscribe });
      service[ '_onProductPurchase' ] = onProductPurchase;

      service.watchForProductPurchase(productAddress);
      expect(dataProductService.watchForDataProductUpdate.calls.count()).toBe(1);
      expect(subscribe.calls.count()).toBe(1);

      const subscribeCallback = subscribe.calls.allArgs()[ 0 ][ 0 ];
      subscribeCallback(subscriptionCallbackResult);

      expect(onProductPurchase.calls.count()).toBe(1);
      expect(onProductPurchase.calls.allArgs()[ 0 ][ 0 ]).toBe(subscriptionCallbackResult);
    });
  });

  describe('#_onProductPurchase()', () => {
    it('should call pushNotification method on NotificationsService instance', () => {
      const purchaseEvent = {
        dataProductAddress: productAddress,
        userAddress: '0x01',
        dataProductUpdateAction: DataProductUpdateAction.PURCHASE,
        blockNumber: 1
      };

      service[ '_onProductPurchase' ](purchaseEvent);
      expect(notificationsService.pushNotification.calls.count()).toBe(1);
      expect(notificationsService.pushNotification.calls.allArgs()[ 0 ][ 0 ]).toEqual(new Notification(
        NotificationType.DATA_PRODUCT_TO_FINALISATION, {
          purchaseEvent
        }));
    });
  });

  describe('#_parseDataProductToFinalisation()', () => {
    it('should return correct notification message when transaction is finalised', async () => {
      dataProductService.getTransactionData.and.returnValue({
        publicKey: 'PUBLIC_KEY',
        buyerMetaHash: 'BUYER_META_HASH',
        price: new BigNumber(1),
        purchased: true,
        finalised: true,
        rated: false,
        rating: new BigNumber(0)
      });
      const purchaseEvent = {
        dataProductAddress: productAddress,
        userAddress: '0x01',
        dataProductUpdateAction: DataProductUpdateAction.PURCHASE,
        blockNumber: 1
      };
      const notification = new Notification(NotificationType.DATA_PRODUCT_TO_FINALISATION, {
        purchaseEvent
      });

      const result = await service[ '_parseDataProductToFinalisation' ](notification);
      expect(notification.read).toBeTruthy();
      expect(result).toBe(`User with account 0x01 purchased your product ${productAddress}. Please finalise this transaction.`);
    });
  });
})
;
