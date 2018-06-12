import { Injectable } from '@angular/core';
import { Encoder } from './encoder';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class VaultService {
  constructor(private storage: StorageService) {
  }

  static getStorageKey(vaultName: string) {
    return `vault_${vaultName}`;
  }

  hasVault(name: string) {
    const storageKey = VaultService.getStorageKey(name);
    return this.storage.getItem(storageKey) !== null;
  }

  async getValue(vaultName, password, itemName): Promise<string> {
    const storageKey = VaultService.getStorageKey(vaultName);
    const serializedData = this.storage.getItem(storageKey);
    const decodedDataString = await Encoder.decodeFromString(serializedData, password);
    const result = JSON.parse(decodedDataString);

    return result[ itemName ];
  }

  async storeValue(vaultName, password, itemName, itemValue) {
    let vaultData = {};
    const storageKey = VaultService.getStorageKey(vaultName);
    const serializedData = this.storage.getItem(storageKey);

    if (serializedData) {
      const decodedDataString = await Encoder.decodeFromString(serializedData, password);
      vaultData = JSON.parse(decodedDataString);
    }

    vaultData[ itemName ] = itemValue;

    const encodedDataString = await Encoder.encodeToString(JSON.stringify(vaultData), password);
    return this.storage.setItem(storageKey, encodedDataString);
  }
}
