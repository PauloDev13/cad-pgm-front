import { Component, computed, input, model, signal } from '@angular/core';
import { MatFormField, MatOption, MatSelect } from '@angular/material/select';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-custom-select',
  imports: [MatSelect, MatFormField, MatOption, MatLabel],
  template: `
    <div class="flex flex-col w-full">
      <mat-form-field appearance="outline" floatLabel="always" class="w-full">
        <mat-label>{{ label() }}</mat-label>

        <mat-select
          [placeholder]="placeholder()"
          [value]="selectedValue()"
          (selectionChange)="onSelectionChange($event.value)"
          (openedChange)="onOpenedChange($event)"
          [errorStateMatcher]="errorMatcher"
        >
          @for (item of data(); track item[valueKey()]) {
            <mat-option [value]="item[valueKey()]">
              {{ item[displayKey()] }}
            </mat-option>
          }
        </mat-select>
      </mat-form-field>

      @if (showError()) {
        <span class="text-[#f44336] text-[12px] px-3 pt-1 font-normal tracking-wide">
          {{ showError() }}
        </span>
      }
    </div>
  `,
  styles: ``,
})
export class CustomSelectComponent {
  // 1. Inputs de Dados e Configuração Visual
  data = input.required<any[]>();
  label = input<string>('Selecione');
  placeholder = input<string>('Clique para selecionar');

  // 2. Chaves dinâmicas (Padrão: mostra 'nome', emite 'id')
  displayKey = input<string>('nome');
  valueKey = input<string>('id');

  // 3. O Model para enviar o ID selecionado de volta ao pai
  selectedValue = model<number | null>(null);

  // 4. Tratamento de Erros vindo do Pai
  hasExternalError = input<boolean>(false);
  errorMessage = input<string | undefined>('');
  externalTouched = input<boolean>(false);

  // Estado interno de toque
  touched = signal(false);

  // Computa se deve exibir erro
  showError = computed(() => {
    const isTouched = this.touched() || this.externalTouched();
    if (isTouched && this.hasExternalError()) {
      return this.errorMessage();
    }
    return null;
  });

  // O "Fofoqueiro" que pinta a borda de vermelho
  errorMatcher: ErrorStateMatcher = {
    isErrorState: () => this.showError() !== null,
  };

  // Eventos para atualizar o Model e o estado de Toque
  onSelectionChange(value: number) {
    this.selectedValue.set(value);
    this.touched.set(true);
  }

  // Detecta quando o usuário abre e fecha o select sem escolher nada
  onOpenedChange(isOpen: boolean) {
    if (!isOpen) {
      this.touched.set(true);
    }
  }
}
