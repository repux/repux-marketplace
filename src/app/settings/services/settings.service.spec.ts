import { Settings, SettingsService } from './settings.service';
import { from } from 'rxjs';
import { environment } from '../../../environments/environment';
import Wallet from '../../shared/models/wallet';

describe('SettingsService()', () => {
  const wallet = new Wallet('0x00', 0);

  let service: SettingsService;
  let walletServiceSpy, storageServiceSpy;

  beforeEach(() => {
    walletServiceSpy = jasmine.createSpyObj('WalletService', [ 'getWallet' ]);
    walletServiceSpy.getWallet.and.returnValue(from(Promise.resolve(wallet)));

    storageServiceSpy = jasmine.createSpyObj('StorageService', [ 'getItem', 'setItem' ]);

    service = new SettingsService(walletServiceSpy, storageServiceSpy);
    service[ 'wallet' ] = wallet;
  });

  describe('#get daysToDeliver()', () => {
    it('should return default when there is no value in storage', () => {
      storageServiceSpy.getItem.and.returnValue(undefined);

      expect(service.daysToDeliver).toBe(environment.repux.defaultDaysToDeliver);
    });

    it('should return value from storage when there is any', () => {
      const daysToDeliver = 5;
      storageServiceSpy.getItem.and.returnValue({ daysToDeliver });

      expect(service.daysToDeliver).toBe(daysToDeliver);
    });

    it('should use wallet address to create storage key', () => {
      expect(service.daysToDeliver).not.toBeUndefined();
      expect(storageServiceSpy.getItem.calls.allArgs()[ 0 ]).toEqual([ `${SettingsService.STORAGE_KEY}_${wallet.address}` ]);
    });
  });

  describe('#set daysToDeliver()', () => {
    it('should call storageService.setItem', () => {
      const daysToDeliver = 10;
      service.daysToDeliver = daysToDeliver;

      expect(storageServiceSpy.setItem.calls.allArgs()[ 0 ]).toEqual([
        `${SettingsService.STORAGE_KEY}_${wallet.address}`,
        { daysToDeliver }
      ]);
    });
  });

  describe('#get daysToDeliverOptions', () => {
    it('should return array of number from 0 to maxDaysToDeliver', () => {
      expect(service.daysToDeliverOptions).toEqual([ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]);
    });
  });

  describe('#getSettings()', () => {
    it('should return observable which exposes settings object', () => {
      return new Promise(resolve => {
        service.getSettings().subscribe((settings: Settings) => {
          expect(settings.daysToDeliver).toBe(environment.repux.defaultDaysToDeliver);

          resolve();
        });
      });
    });
  });
});
