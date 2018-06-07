import { VaultModule } from './vault.module';

describe('SecureVaultModule', () => {
  let secureVaultModule: VaultModule;

  beforeEach(() => {
    secureVaultModule = new VaultModule();
  });

  it('should create an instance', () => {
    expect(secureVaultModule).toBeTruthy();
  });
});
