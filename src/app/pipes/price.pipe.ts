import {Pipe, PipeTransform} from '@angular/core';
import {CurrencyPosition} from '../enums/currency-position.enum';

@Pipe({
  name: 'priceFormat'
})
export class PricePipe implements PipeTransform {

  transform(value: number, currency: string = '$', position: CurrencyPosition = CurrencyPosition.LEFT): string {
    if (isNaN(value)) return 'Invalid price';
    const formattedPrice = value.toFixed(2);

    return position === CurrencyPosition.LEFT ? `${currency} ${formattedPrice}` : `${formattedPrice} ${currency}`;
  }

}
