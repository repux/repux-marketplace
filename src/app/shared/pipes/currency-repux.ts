import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CurrencyPipe } from '@angular/common';

const currencyName = ` ${environment.repux.currency.defaultName} `;
const currencyFormat = environment.repux.currency.format;

@Pipe({ name: 'currencyRepux' })
export class CurrencyRepuxPipe extends CurrencyPipe implements PipeTransform {
  transform(value: any): string {
    return super.transform(value, '', currencyName, currencyFormat);
  }
}
