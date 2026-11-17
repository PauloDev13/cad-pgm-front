import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Field, FormField } from '@angular/forms/signals';
import { MatInputModule } from '@angular/material/input';
import { FieldWrapperComponent } from '../../../shared/layout/component/field-wrapper/field-wrapper.component';

@Component({
  selector: 'app-form-fluxo-chamado',
  imports: [MatFormFieldModule, FormField, MatInputModule, FieldWrapperComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form autocomplete="off" class="flex flex-col gap-4">
      <p [class]="classValue()
      ? classValue()
      : 'text-xs text-gray-600 font-medium m-0'"
      >
        {{ titleMessage() }}
      </p>

      <app-field-wrapper [field]="fieldValue()">
        <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
          <mat-label>{{ label() }}</mat-label>
          <textarea
            matInput
            [rows]="rowsValue()"
            [formField]="formControlField()"
            [placeholder]="placeholder()"
          ></textarea>
        </mat-form-field>
      </app-field-wrapper>

      <!--  input só é exibo quando é chamada o dialog 'Concluir' atendimento-->
      @if (isConcluirChamado()) {
        <app-field-wrapper [field]="fieldValueNumReq()">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>{{ labelNumReq() }}</mat-label>
            <input
              matInput
              [formField]="formControlFieldNumReq()!"
              [placeholder]="placeholderNumReq()"
            />
          </mat-form-field>
        </app-field-wrapper>

      }
    </form>
  `
})
export class FormFluxoChamadoComponent {
  // Textos
  titleMessage = input.required<string>();
  classValue = input<string>();

  isConcluirChamado = input<boolean>(false);

  // Input observação
  label = input.required<string>();
  placeholder = input<string>(''); // Opcional, valor default vazio
  rowsValue = input<number>(4);
  // Controles de Formulário tipados
  fieldValue = input.required<any | unknown>();
  formControlField = input.required<Field<any, string | number>>();

  // Input número requisição eCidade
  labelNumReq = input<string>();
  placeholderNumReq = input<string>(''); // Opcional, valor default vazio
  // Controles de Formulário tipados
  fieldValueNumReq = input<any | unknown>();
  formControlFieldNumReq = input<Field<any, string | number>>();
}
