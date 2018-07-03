import { NotificationsService } from './notifications.service';
import { TestBed } from '@angular/core/testing';
import { NotificationType } from './notification-type';
import { Notification } from './notification';
import { WalletService } from '../services/wallet.service';
import { StorageService } from '../services/storage.service';
import Wallet from '../shared/models/wallet';
import { from } from 'rxjs';
import Spy = jasmine.Spy;

describe('NotificationsService', () => {
  let service: NotificationsService;
  let exampleNotification: Notification;
  let walletServiceSpy, storageServiceSpy;
  const walletAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(async () => {
    storageServiceSpy = jasmine.createSpyObj('StorageService', [ 'getItem', 'setItem' ]);
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    const wallet = new Wallet(walletAddress, 1);
    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(wallet)));

    TestBed.configureTestingModule({
      providers: [
        { provide: WalletService, useValue: walletServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    });

    service = TestBed.get(NotificationsService);
    await service.addParser(NotificationType.DATA_PRODUCT_PURCHASED, (notification: Notification) => Promise.resolve('RESULT'));
    await service.addParser(NotificationType.DATA_PRODUCT_TO_FINALISATION, (notification: Notification) => Promise.resolve('RESULT'));
    exampleNotification = new Notification(NotificationType.DATA_PRODUCT_TO_FINALISATION, {});
  });

  describe('#addParser()', () => {
    it('should add parser function to specified notification type and call _init method', () => {
      service[ '_init' ] = jasmine.createSpy();
      const parser = (notification: Notification) => Promise.resolve('RESULT');
      service.addParser(NotificationType.DATA_PRODUCT_TO_FINALISATION, parser);
      expect(service[ '_parsers' ][ NotificationType.DATA_PRODUCT_TO_FINALISATION ]).toEqual(parser);
      expect((<any> service[ '_init' ]).calls.count()).toBe(1);
    });
  });

  describe('#saveNotifications()', () => {
    it('should call _saveToStore method', () => {
      service[ '_saveToStore' ] = jasmine.createSpy();
      service.saveNotifications();
      expect((<Spy> service[ '_saveToStore' ]).calls.count()).toBe(1);
      expect((<Spy> service[ '_saveToStore' ]).calls.allArgs()[ 0 ][ 0 ]).toEqual({
        notifications: []
      });
    });
  });

  describe('#get notifications()', () => {
    it('should return notifications', () => {
      let catchedErrors = 0;
      service[ '_config' ][ 'notifications' ] = [ exampleNotification ];
      const result = service.notifications;
      expect(result).toEqual(service[ '_config' ][ 'notifications' ]);
      try {
        result[ 'push' ](exampleNotification);
      } catch (error) {
        catchedErrors++;
      }
      expect(result).toEqual(service[ '_config' ][ 'notifications' ]);
      expect(catchedErrors).toBe(1);
    });
  });

  describe('#pushNotification()', () => {
    it('should add notification to list, parse it and call saveNotifications', async () => {
      service[ 'saveNotifications' ] = jasmine.createSpy();
      service[ '_parseNotification' ] = jasmine.createSpy();
      await service.pushNotification(exampleNotification);
      expect((<Spy> service[ 'saveNotifications' ]).calls.count()).toBe(1);
      expect((<Spy> service[ '_parseNotification' ]).calls.count()).toBe(1);
    });
  });

  describe('#_parseNotification()', () => {
    it('should call parser by type and _displayNotification method', async () => {
      const notificationString = 'NOTIFICATION_STRING';
      const parser = jasmine.createSpy();
      parser.and.returnValue(notificationString);
      service[ '_parsers' ][ NotificationType.DATA_PRODUCT_TO_FINALISATION ] = parser;
      service[ '_displayNotification' ] = jasmine.createSpy();
      await service[ '_parseNotification' ](exampleNotification);
      expect(parser.calls.count()).toBe(1);
      expect((<Spy> service[ '_displayNotification' ]).calls.count()).toBe(1);
      expect((<Spy> service[ '_displayNotification' ]).calls.allArgs()[ 0 ][ 0 ]).toBe(notificationString);
    });
  });

  describe('#_init()', () => {
    it('should fetch config and parse each stored notification', async () => {
      const readFromStore = jasmine.createSpy();
      const parseNotification = jasmine.createSpy();
      readFromStore.and.returnValue({
        notifications: [ exampleNotification ]
      });
      service[ '_readFromStore' ] = readFromStore;
      service[ '_parseNotification' ] = parseNotification;
      await service[ '_init' ]();
      expect(readFromStore.calls.count()).toBe(1);
      expect(parseNotification.calls.count()).toBe(1);
      expect(parseNotification.calls.allArgs()[ 0 ][ 0 ]).toEqual(exampleNotification);
    });
  });

  describe('#_readFromStore()', () => {
    it('should return config from storage', async () => {
      const expectedResult = {
        notifications: [ { type: 'DATA_PRODUCT_TO_FINALISATION', data: {} } ]
      };
      storageServiceSpy.getItem.and.returnValue(expectedResult);
      const result = await service[ '_readFromStore' ]();
      expect(<any> result).toEqual(expectedResult);
    });

    it('should return new config when there is none in storage', async () => {
      storageServiceSpy.getItem.and.returnValue(null);
      const result = await service[ '_readFromStore' ]();
      expect(<any> result).toEqual({
        notifications: []
      });
    });
  });

  describe('#_saveToStore()', () => {
    it('should call set item on storage', async () => {
      await service[ '_saveToStore' ]({ notifications: [] });
      expect(storageServiceSpy.setItem.calls.count()).toBe(2);
      expect(storageServiceSpy.setItem.calls.allArgs()[ 0 ][ 1 ]).toEqual({ notifications: [] });
    });
  });
});
