import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormField } from '@angular/forms/signals';
import { BaseEntityDTO } from '../../../features/servidor/models/servidor.model';
import { FormErrorComponent } from '../form-error/form-error.component';

@Component({
  selector: 'app-custom-select',
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule, FormField, FormErrorComponent],
  standalone: true,
  template: `
    @if (field()) {
      <mat-form-field
        appearance="outline"
        class="w-full"
        subscriptSizing="dynamic"
        floatLabel="always"
      >
        <mat-label>{{ label() }}</mat-label>
        <mat-select [formField]="field" [placeholder]="placeholder()">
          @for (option of options(); track option.id) {
            <mat-option [value]="option.id">
              {{ option.nome || option.descricao }}
            </mat-option>
          }
        </mat-select>
      </mat-form-field>

      <app-form-error [field]="field()" />
    } @else {
      <mat-form-field appearance="outline" class="w-full" floatLabel="always">
        <mat-select [(value)]="value" [placeholder]="placeholder()" [multiple]="multiple()">
          @for (option of options(); track option.id) {
            <mat-option [value]="option.id">
              {{ option.nome || option.email }}
            </mat-option>
          }
        </mat-select>
      </mat-form-field>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSelectComponent {
  // INPUTS obrigatórios
  label = input.required<string>();
  options = input.required<BaseEntityDTO[]>();

  // INPUTS opcionais
  placeholder = input<string>('');

  // Habilita a seleção múltipla (Padrão: false)
  multiple = input<boolean>(false);

  // O field passa a ser opcional (pois nem sempre usaremos formulário)
  field = input<any>();

  // Cria um sinal bidirecional para quando usarmos variável livre (Modo 2)
  value = model<any>();
}
