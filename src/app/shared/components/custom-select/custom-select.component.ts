import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormField } from '@angular/forms/signals';
import { FormErrorComponent } from '../form-error/form-error.component';
import { BaseEntityDTO } from '../../../features/servidor/models/servidor.model';

@Component({
  selector: 'app-custom-select',
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule, FormField, FormErrorComponent],
  standalone: true,
  template: `
    @if (field()) {
      <div class="flex flex-col w-full">
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
                {{ option.nome || option.descricao || option.email }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <div class="min-h-[20px] w-full pt-1 px-4">
          <app-form-error [field]="field()" />
        </div>
      </div>
    } @else {
      <div class="flex flex-col w-full">
        <mat-form-field
          appearance="outline"
          class="w-full"
          floatLabel="always"
          subscriptSizing="dynamic"
        >
          <mat-label>{{ label() }}</mat-label>
          <mat-select [(value)]="value" [placeholder]="placeholder()" [multiple]="multiple()">
            @for (option of options(); track option.id) {
              <mat-option [value]="option.id">
                {{ option.nome || option.descricao || option.email }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
        <div class="min-h-[20px] w-full pt-1 px-4"></div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
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
