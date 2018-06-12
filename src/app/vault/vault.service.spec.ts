import { TestBed } from '@angular/core/testing';

import { VaultService } from './vault.service';
import { StorageService, StorageServiceFactory } from './storage.service';

describe('VaultService', () => {
  let service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ {
        provide: StorageService,
        useFactory: StorageServiceFactory
      }, VaultService ]
    });

    service = TestBed.get(VaultService);
  });

  describe('#hasVault', () => {
    it('should return true if exists', () => {
      const vaultName = 'some name';
      const vaultInStorage = `vault_${vaultName}`;

      localStorage.setItem(vaultInStorage, 'a');
      expect(service.hasVault(vaultName)).toBeTruthy();

      localStorage.removeItem(vaultInStorage);
    });

    it('should return false if not exists', () => {
      const vaultName = 'some other vault';

      expect(service.hasVault(vaultName)).toBeFalsy();
    });
  });

  describe('#storeValue', () => {
    it('should save value with encoded vault in storage', async () => {
      const vaultName = 'keystore';
      const vaultInStorage = `vault_${vaultName}`;
      const vaultPassword = 'repux';
      const itemKey1 = 'pk';
      const itemValue1 = 'my private key';
      const itemKey2 = 'pub';
      const itemValue2 = 'my public key';

      await service.storeValue(vaultName, vaultPassword, itemKey1, itemValue1);
      await service.storeValue(vaultName, vaultPassword, itemKey2, itemValue2);

      const itemValueFromStorage1 = await service.getValue(vaultName, vaultPassword, itemKey1);
      const itemValueFromStorage2 = await service.getValue(vaultName, vaultPassword, itemKey2);

      localStorage.removeItem(vaultInStorage);

      expect(itemValueFromStorage1).toEqual(itemValue1);
      expect(itemValueFromStorage2).toEqual(itemValue2);
    });
  });
});
