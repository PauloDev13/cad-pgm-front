import { Directive, HostListener } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[dateMask]'
})
// Diretiva para aplicar uma máscara "dd/MM/yyyy" no componente datepicker
export class DateMaskDirective {
  @HostListener('input', ['$event'])
  onInput(event: any) {
    const input = event.target;
    // Remove tudo que não for número
    let value = input.value.replace(/\D/g, '');

    // Limita a 8 dígitos (DDMMAAAA)
    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    // Insere as barras de forma automática
    if (value.length > 4) {
      value = value.replace(/^(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d+)/, '$1/$2');
    }

    // Devolve o valor visualmente formatado para o input
    input.value = value;
  }
}
