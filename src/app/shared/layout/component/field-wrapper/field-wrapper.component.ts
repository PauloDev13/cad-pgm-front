import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormErrorComponent } from '../../../components/form-error/form-error.component'; // Ajuste o path

@Component({
  selector: 'app-field-wrapper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormErrorComponent],
  template: `
    <div class="flex flex-col w-full relative">

      <ng-content></ng-content>

      <!--Chama o componente customizado para exibir os erros-->
      <div class="min-h-[20px] w-full pt-0 px-3">
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
