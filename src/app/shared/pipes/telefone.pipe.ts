import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'telefone',
  standalone: true
})
export class TelefonePipe implements PipeTransform {
  transform(value: string | number | null | undefined, ...args: unknown[]): string {
    if (!value) return '';

    const numberOnly = String(value).replace(/\D/g, '');

    if (numberOnly.length === 11) {
      // $1: O começo, $2: Os 3 números antes do hífen, $3: O último dígito
      return numberOnly.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    }

    if (numberOnly.length === 10) {
      // $1: O começo, $2: Os 3 números antes do hífen, $3: O último dígito
      return numberOnly.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3');
    }


    return String(value);
  }
}
