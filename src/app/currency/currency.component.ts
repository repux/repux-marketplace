import { Component, Input } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent {
  @Input() public value: BigNumber;
  @Input() public precision: number = environment.repux.currency.precision;
  @Input() public currencyName: string = environment.repux.currency.defaultName;
  @Input() public nameBeforeValue: boolean;

  get displayedValue(): string {
    if (!this.value) {
      return '0';
    }

    const stringValue = this.value.toString();
    const formattedValue = this.value.toFormat(this.precision);

    if (stringValue.length < formattedValue.length) {
      return stringValue;
    }

    return formattedValue;
  }
}
