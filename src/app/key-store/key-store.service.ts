import { Injectable } from '@angular/core';
import { VaultService } from '../vault/vault.service';

@Injectable({
  providedIn: 'root'
})
export class KeyStoreService {
  private static VAULT_NAME = 'keystore';
  private static LS_PASSWORD_HASH = 'keystore_phash';

  static PRIVATE_KEY = 'pk';
  static PUBLIC_KEY = 'pub';

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

  constructor(private vaultService: VaultService) {
  }

  hasKeys() {
    return this.vaultService.hasVault(KeyStoreService.VAULT_NAME);
  }

  async store(item: string, value: {}, password: string): Promise<void> {
    return this.vaultService.storeValue(KeyStoreService.VAULT_NAME, password, item, JSON.stringify(value));
  }

  async get(item: string, password: string): Promise<string> {
    return this.vaultService.getValue(KeyStoreService.VAULT_NAME, password, item);
  }

  async getKeys(password: string): Promise<{ privateKey: JsonWebKey, publicKey: JsonWebKey }> {
    const publicKeySerialized = await this.vaultService.getValue(KeyStoreService.VAULT_NAME, password, KeyStoreService.PUBLIC_KEY);
    const privateKeySerialized = await this.vaultService.getValue(KeyStoreService.VAULT_NAME, password, KeyStoreService.PRIVATE_KEY);

    const privateKey = JSON.parse(privateKeySerialized) as JsonWebKey;
    const publicKey = JSON.parse(publicKeySerialized) as JsonWebKey;

    return {
      privateKey,
      publicKey
    };
  }

  savePasswordAsHash(password: string): void {
    const hash = KeyStoreService.hashCode(password);
    localStorage.setItem(KeyStoreService.LS_PASSWORD_HASH, hash.toString());
  }
}
