import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';
import { Directive, Input } from '@angular/core';

export function maxFileSizeValidator(maxFileSize: number): ValidatorFn {
  return (control: AbstractControl): { [ key: string ]: any } | null => {
    if (!(control.value instanceof FileList)) {
      return null;
    }

    for (const file of Array.from(control.value)) {
      if (file.size >= maxFileSize) {
        return { 'maxFileSizeExceeded': { value: control.value } };
      }
    }
  };
}

@Directive({
  selector: '[appMaxFileSize]',
  providers: [ { provide: NG_VALIDATORS, useExisting: MaxFileSizeDirective, multi: true } ]
})
export class MaxFileSizeDirective implements Validator {
  @Input() appMaxFileSize: number;

  validate(control: AbstractControl): { [ key: string ]: any } | null {
    return this.appMaxFileSize
      ? maxFileSizeValidator(this.appMaxFileSize)(control)
      : null;
  }
}
