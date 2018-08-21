import { Component, HostListener, Input, OnChanges } from '@angular/core';
import BigNumber from 'bignumber.js';
import { environment } from '../../../../environments/environment';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-price-input',
  templateUrl: './price-input.component.html',
  styleUrls: [ 'price-input.component.scss' ]
})
export class PriceInputComponent implements OnChanges {
  @Input() placeholder: string;
  @Input() required = false;
  @Input() value: BigNumber;
  @Input() precision = environment.repux.currency.precision;
  @Input() formControl = new FormControl(undefined);
  @Input() currencyName = environment.repux.currency.defaultName;

  get pattern(): RegExp {
    return new RegExp('^\\d*([,\\.]\\d{0,' + this.precision + '})?$');
  }

  @HostListener('paste', [ '$event' ]) blockPaste(e: KeyboardEvent): void {
    e.preventDefault();
  }

  ngOnChanges(): void {
    const stringValue = this.value || this.formControl.value;
    let value;

    if (stringValue) {
      value = new BigNumber(stringValue);
    }

    this.value = value;
    this.formControl.setValue(value ? value.toFixed() : undefined);
  }

  onChange(): void {
    if (this.value !== undefined) {
      this.formControl.setValue(this.value.toFixed());
    }
  }

  onInput(event): void {
    if (event.target.value === '') {
      this.value = undefined;

      return;
    }

    if (this.pattern.test(event.target.value)) {
      this.value = new BigNumber(event.target.value.replace(/,/g, '.'));
      this.formControl.setValue(event.target.value);
    } else {
      this.formControl.setValue(this.value.toFixed());
    }
  }

  isNumber(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    if ((charCode === 44 || charCode === 46) && (this.formControl.value.includes(',') || this.formControl.value.includes('.'))) {
      return false;
    }

    return !(charCode > 31 && (charCode < 48 || charCode > 57)) || charCode === 44 || charCode === 46;
  }
}
