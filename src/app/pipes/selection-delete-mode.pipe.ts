import {Pipe, PipeTransform} from '@angular/core';
import {CurrencyPosition} from '../enums/currency-position.enum';

@Pipe({
  name: 'selectionDeleteMode'
})
export class SelectionDeleteModePipe implements PipeTransform {

  transform(selectionMode: boolean): string {
    return selectionMode ? 'Selection mode' : `Delete products`;
  }

}
