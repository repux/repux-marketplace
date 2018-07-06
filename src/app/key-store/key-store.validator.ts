import { KeyStoreService } from './key-store.service';
import { FormControl } from '@angular/forms';

export function ValidatePassword(c: FormControl) {
  return KeyStoreService.isPasswordValid(c.value) ? null : {
    validatePassword: {
      valid: false
    }
  };
}
