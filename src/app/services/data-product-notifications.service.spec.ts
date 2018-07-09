import { DataProductNotificationsService } from './data-product-notifications.service';
import { NotificationType } from '../notifications/notification-type';
import { DataProductUpdateAction } from 'repux-web3-api';
import { Notification } from '../notifications/notification';
import Wallet from '../shared/models/wallet';
import { PendingFinalisationService } from './data-product-notifications/pending-finalisation.service';
import { AwaitingFinalisationService } from './data-product-notifications/awaiting-finalisation.service';
import { ReadyToDownloadService } from './data-product-notifications/ready-to-download.service';

describe('DataProductNotificationsService', () => {
  let service: DataProductNotificationsService;
  let notificationsService, repuxLibService, dataProductService, keyStoreService, taskManagerService, matDialog,
    walletService, pendingFinalisationService, awaitingFinalisationService, readyToDownloadService;
  const productAddress = '0x1111111111111111111111111111111111111111';
  const walletAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(() => {
    notificationsService = jasmine.createSpyObj(
      'NotificationsService',
      [ 'addParser', 'pushNotification', 'saveNotifications' ]
    );
    repuxLibService = jasmine.createSpyObj(
      'RepuxLibService',
      [ 'getInstance' ]
    );
    dataProductService = jasmine.createSpyObj(
      'DataProductService',
      [
        'getCreatedDataProducts',
        'getBoughtDataProducts',
        'watchForDataProductUpdate',
        'getDataProductData',
        'getTransactionData'
      ]
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
    dataProductService.getBoughtDataProducts.and.returnValue(Promise.resolve([]));
    pendingFinalisationService = new PendingFinalisationService(dataProductService, notificationsService);
    awaitingFinalisationService = new AwaitingFinalisationService(dataProductService, notificationsService);
    readyToDownloadService = new ReadyToDownloadService(
      dataProductService,
      notificationsService,
      awaitingFinalisationService,
      pendingFinalisationService
    );

    service = new DataProductNotificationsService(
      notificationsService,
      dataProductService,
      walletService,
      pendingFinalisationService,
      awaitingFinalisationService,
      readyToDownloadService
    );
  });

  describe('#constructor()', () => {
    it('should call getWallet on WalletService', () => {
      expect(walletService.getWallet.calls.count()).toBe(1);
    });

    it('should initialise _parsers array', () => {
      expect(service[ '_parsers' ]).toEqual([
        pendingFinalisationService,
        awaitingFinalisationService,
        readyToDownloadService
      ]);
    });
  });

  describe('#_init()', () => {
    it('should create watchers for all products created by user', async () => {
      dataProductService.getCreatedDataProducts.and.returnValue(Promise.resolve([ productAddress ]));
      const watchForProductPurchase = jasmine.createSpy();
      const watchForAllProductPurchases = jasmine.createSpy();
      service[ 'watchForProductPurchase' ] = watchForProductPurchase;
      service[ 'watchForAllProductPurchases' ] = watchForAllProductPurchases;

      await service[ '_init' ]();
      expect(watchForProductPurchase.calls.count()).toBe(2);
      expect(watchForProductPurchase.calls.allArgs()[ 0 ][ 0 ]).toBe(productAddress);
      expect(watchForAllProductPurchases.calls.count()).toBe(2);
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
        userAddress: walletAddress,
        dataProductUpdateAction: DataProductUpdateAction.PURCHASE,
        blockNumber: 1
      };

      const watchForProductPurchase = jasmine.createSpy();
      service[ 'watchForProductPurchase' ] = watchForProductPurchase;
      service[ '_createdProductsAddresses' ] = [ productAddress ];

      service[ '_onProductPurchase' ](purchaseEvent);
      expect(watchForProductPurchase.calls.count()).toBe(1);
      expect(notificationsService.pushNotification.calls.count()).toBe(1);
      expect(notificationsService.pushNotification.calls.allArgs()[ 0 ][ 0 ]).toEqual(new Notification(
        NotificationType.DATA_PRODUCT_PURCHASED, {
          purchaseEvent
        }));
    });
  });
})
;
