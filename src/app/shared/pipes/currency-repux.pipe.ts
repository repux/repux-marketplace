import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';
import BigNumber from 'bignumber.js';

const currencyName = environment.repux.currency.defaultName;
const currencyPrecision = environment.repux.currency.precision;
const minimumPrecision = 2;

@Pipe({ name: 'currencyRepux' })
export class CurrencyRepuxPipe implements PipeTransform {
  transform(value: any, name: string = currencyName, precision: number = currencyPrecision): string {
    const number = new BigNumber(value);
    let string = number.toFormat(precision);

    while (((string.slice(-1) === '0' || string.slice(-1) === '.') && string.indexOf('.') !== -1) &&
    string.split('.')[ 1 ].length > minimumPrecision) {
      string = string.substr(0, string.length - 1);
    }

    return name + ' ' + string;
  }
}

