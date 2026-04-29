import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'matricula',
  standalone: true
})
export class MatriculaPipe implements PipeTransform {
  transform(value: string | number | null | undefined, ...args: unknown[]): string {
    if (!value) return '';

    const strValue = String(value).trim();

    if (strValue.toUpperCase().startsWith('T')) {
      return strValue;
    }

    const numberOnly = strValue.replace(/\D/g, '');

    if (numberOnly.length >= 5) {
      // $1: O começo, $2: Os 3 números antes do hífen, $3: O último dígito
      return numberOnly.replace(/(\d+)(\d{3})(\d{1})$/, '$1.$2-$3');
    }

    return numberOnly;
  }
}
