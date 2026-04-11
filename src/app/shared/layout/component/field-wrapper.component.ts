import { Component, input } from '@angular/core';
import { FormErrorComponent } from '../../components/form-error/form-error.component'; // Ajuste o path

@Component({
  selector: 'app-field-wrapper',
  standalone: true,
  imports: [FormErrorComponent],
  template: `
    <div class="flex flex-col relative mb-8">

      <ng-content></ng-content>

      <!--Chama o componente customizado para exibir os erros-->
      <div class="absolute top-full left-0 w-full pt-1 z-10">
        <app-form-error [field]="field()" />
      </div>

    </div>
  `
})
export class FieldWrapperComponent {
  /**
   * Recebe o sinal do campo (vindo da sua biblioteca de Signal Forms)
   */
  field = input.required<any>();
}
