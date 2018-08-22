import { Injectable } from '@angular/core';
import { VaultService } from '../vault/vault.service';
import { StorageService } from '../vault/storage.service';

@Injectable({
  providedIn: 'root'
})
export class KeyStoreService {
  static PRIVATE_KEY = 'pk';
  static PUBLIC_KEY = 'pub';
  private static VAULT_NAME = 'keystore';
  private static LS_PASSWORD_HASH = 'keystore_phash';

  constructor(
    private vaultService: VaultService,
    private storageService: StorageService) {
  }

  static hashCode(input): number {
    const inputLength = input.length;
    let hash = 0;
    let i = 0;
    if (inputLength > 0) {
      while (i < inputLength) {
        // tslint:disable:no-bitwise
        hash = (hash << 5) - hash + input.charCodeAt(i++) | 0;
        // tslint:enable:no-bitwise
      }
    }

    return hash;
  }

  static isPasswordValid(password: string) {
    const passwordHashFromStorage = +localStorage.getItem(KeyStoreService.LS_PASSWORD_HASH);
    return passwordHashFromStorage === KeyStoreService.hashCode(password);
  }

  hasKeys(): boolean {
    return Boolean(this.vaultService.hasVault(`${KeyStoreService.VAULT_NAME}`) &&
      this.storageService.getItem(KeyStoreService.PUBLIC_KEY) &&
      this.storageService.getItem(KeyStoreService.LS_PASSWORD_HASH)
    );
  }

  async storePrivateKey(value: {}, password: string): Promise<void> {
    return this.vaultService.storeValue(KeyStoreService.VAULT_NAME, password, KeyStoreService.PRIVATE_KEY, JSON.stringify(value));
  }

  storePublicKey(value: {}): void {
    return this.storageService.setItem(KeyStoreService.PUBLIC_KEY, JSON.stringify(value));
  }

  getPublicKey(): JsonWebKey {
    const publicKeySerialized = this.storageService.getItem(KeyStoreService.PUBLIC_KEY);

    return JSON.parse(publicKeySerialized) as JsonWebKey;
  }

  async getPrivateKey(password: string): Promise<JsonWebKey> {
    const privateKeySerialized = await this.vaultService.getValue(KeyStoreService.VAULT_NAME, password, KeyStoreService.PRIVATE_KEY);

    return JSON.parse(privateKeySerialized) as JsonWebKey;
  }

  savePasswordAsHash(password: string): void {
    const hash = KeyStoreService.hashCode(password);
    localStorage.setItem(KeyStoreService.LS_PASSWORD_HASH, hash.toString());
  }
}
