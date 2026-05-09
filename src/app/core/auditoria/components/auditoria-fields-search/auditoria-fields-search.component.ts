import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatFormFieldModule, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Field, FormField } from '@angular/forms/signals';
import { ActionOptions } from '../../models/audit-response.dto';

@Component({
  selector: 'app-auditoria-fields-search',
  imports: [
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSuffix,
    FormField
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
        <mat-label>Nome Usuário</mat-label>
        <input matInput [formField]="username()" placeholder="Ex: paulo.morais">
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
        <mat-label>Tipo de Ação</mat-label>
        <mat-select [formField]="typeAction()">
          <mat-option value="">Todas</mat-option>
          @for (option of actionOptions; track option.value) {
            <mat-option [value]="option.value">{{ option.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Data Inicial</mat-label>
        <input matInput [matDatepicker]="pickerStart" [formField]="startDate()">
        <mat-datepicker-toggle class="pr-2" matIconSuffix [for]="pickerStart"></mat-datepicker-toggle>
        <mat-datepicker #pickerStart></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Data Final</mat-label>
        <input matInput [matDatepicker]="pickerEnd" [formField]="endDate()">
        <mat-datepicker-toggle class="pr-2" matIconSuffix [for]="pickerEnd"></mat-datepicker-toggle>
        <mat-datepicker #pickerEnd></mat-datepicker>
      </mat-form-field>
    </div>
  `
})
export class AuditoriaFieldsSearchComponent {
  username = input.required<Field<string>>();
  typeAction = input.required<Field<string>>();
  startDate = input.required<Field<Date | null>>();
  endDate = input.required<Field<Date | null>>();

  // Opções para o Select de Ação
  actionOptions: ActionOptions[] = [
    { value: 'INSERT', label: 'Criação (Insert)' },
    { value: 'UPDATE', label: 'Atualização (Update)' },
    { value: 'DELETE', label: 'Exclusão (Delete)' }
  ];
}
