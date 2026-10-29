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
            rows="3"
            [formField]="formControlField()"
            [placeholder]="placeholder()"
          ></textarea>
        </mat-form-field>
      </app-field-wrapper>
    </form>
  `,
})
export class FormFluxoChamadoComponent {
  // Textos
  titleMessage = input.required<string>();
  label = input.required<string>();
  placeholder = input<string>(''); // Opcional, valor default vazio
  rowsValue = input<number>(4);
  classValue = input<string>();

  // Controles de Formulário tipados
  fieldValue = input.required<any | unknown>();
  formControlField = input.required<Field<any, string | number>>();
}
