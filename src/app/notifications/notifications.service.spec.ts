import { NotificationsService } from './notifications.service';
import { TestBed } from '@angular/core/testing';
import { NotificationType } from './notification-type';
import { Notification } from './notification';
import { WalletService } from '../services/wallet.service';
import Spy = jasmine.Spy;

describe('NotificationsService', () => {
  let service: NotificationsService;
  let exampleNotification: Notification;
  const walletAddress = '0x0000000000000000000000000000000000000000';

  beforeEach(async () => {
    const walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getData' ]);
    walletServiceSpy.getData.and.returnValue(Promise.resolve({
      address: walletAddress
    }));
    TestBed.configureTestingModule({
      providers: [
        { provide: WalletService, useValue: walletServiceSpy }
      ]
    });

    service = TestBed.get(NotificationsService);
    await service.addParser(NotificationType.DATA_PRODUCT_TO_APPROVE, (notification: Notification) => Promise.resolve('RESULT'));
    exampleNotification = new Notification(NotificationType.DATA_PRODUCT_TO_APPROVE, {});
  });

  describe('#addParser()', () => {
    it('should add parser function to specified notification type and call _init method', () => {
      service[ '_init' ] = jasmine.createSpy();
      const parser = (notification: Notification) => Promise.resolve('RESULT');
      service.addParser(NotificationType.DATA_PRODUCT_TO_APPROVE, parser);
      expect(service[ '_parsers' ][ NotificationType.DATA_PRODUCT_TO_APPROVE ]).toEqual(parser);
      expect((<any> service[ '_init' ]).calls.count()).toBe(1);
    });
  });

  describe('#saveNotifications()', () => {
    it('should call _setConfig method', () => {
      service[ '_setConfig' ] = jasmine.createSpy();
      service.saveNotifications();
      expect((<Spy> service[ '_setConfig' ]).calls.count()).toBe(1);
      expect((<Spy> service[ '_setConfig' ]).calls.allArgs()[ 0 ][ 0 ]).toEqual({
        notifications: [],
        address: walletAddress
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
      service[ '_parsers' ][ NotificationType.DATA_PRODUCT_TO_APPROVE ] = parser;
      service[ '_displayNotification' ] = jasmine.createSpy();
      await service[ '_parseNotification' ](exampleNotification);
      expect(parser.calls.count()).toBe(1);
      expect((<Spy> service[ '_displayNotification' ]).calls.count()).toBe(1);
      expect((<Spy> service[ '_displayNotification' ]).calls.allArgs()[ 0 ][ 0 ]).toBe(notificationString);
    });
  });

  describe('#_init()', () => {
    it('should fetch config and parse each stored notification', async () => {
      const getConfig = jasmine.createSpy();
      const parseNotification = jasmine.createSpy();
      getConfig.and.returnValue({
        notifications: [ exampleNotification ]
      });
      service[ '_getConfig' ] = getConfig;
      service[ '_parseNotification' ] = parseNotification;
      await service[ '_init' ]();
      expect(getConfig.calls.count()).toBe(1, '1');
      expect(parseNotification.calls.count()).toBe(1, '2');
      expect(parseNotification.calls.allArgs()[ 0 ][ 0 ]).toEqual(exampleNotification);
    });
  });

  describe('#_getConfig()', () => {
    it('should return config from storage', async () => {
      const storage = jasmine.createSpyObj('localStorage', [ 'getItem', 'setItem' ]);
      storage.getItem.and.returnValue(`{"notifications":[{"type": "DATA_PRODUCT_TO_APPROVE", "data": {}}], "address": "${walletAddress}"}`);
      service[ '_storage' ] = storage;
      const result = await service[ '_getConfig' ]();
      expect(<any> result).toEqual({
        notifications: [ { type: 'DATA_PRODUCT_TO_APPROVE', data: {} } ],
        address: walletAddress
      });
    });

    it('should return new config when wallet address is different than address in config', async () => {
      const storage = jasmine.createSpyObj('localStorage', [ 'getItem', 'setItem' ]);
      storage.getItem.and.returnValue(`{"notifications":[{"type": "DATA_PRODUCT_TO_APPROVE", "data": {}}], "address": "0x1"}`);
      service[ '_storage' ] = storage;
      const result = await service[ '_getConfig' ]();
      expect(<any> result).toEqual({
        notifications: [],
        address: walletAddress
      });
    });

    it('should return new config when there is none in storage', async () => {
      const storage = jasmine.createSpyObj('localStorage', [ 'getItem', 'setItem' ]);
      storage.getItem.and.returnValue(null);
      service[ '_storage' ] = storage;
      const result = await service[ '_getConfig' ]();
      expect(<any> result).toEqual({
        notifications: [],
        address: walletAddress
      });
    });
  });

  describe('#_setConfig()', () => {
    it('should call set item on storage', async () => {
      const storage = jasmine.createSpyObj('localStorage', [ 'getItem', 'setItem' ]);
      service[ '_storage' ] = storage;
      await service[ '_setConfig' ]({ notifications: [] });
      expect(storage.setItem.calls.count()).toBe(1);
      expect(storage.setItem.calls.allArgs()[ 0 ][ 1 ]).toBe(`{"notifications":[],"address":"${walletAddress}"}`);
    });
  });
});
