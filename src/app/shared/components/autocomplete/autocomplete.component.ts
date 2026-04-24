import { Component, computed, effect, input, model, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-list-autocomplete',
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    MatError,
    MatLabel
  ],
  standalone: true,
  template: `
    <div class="flex flex-col w-full">
      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        floatLabel="always"
        class="w-full"
      >
        <mat-label>{{ label() }}</mat-label>

        <input
          type="text"
          matInput
          [placeholder]="placeholder()"
          [matAutocomplete]="auto"
          [value]="displayValue()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [errorStateMatcher]="errorMatcher"
        />

        <mat-autocomplete
          #auto="matAutocomplete"
          (optionSelected)="onSelected($event.option.value)"
        >
          @for (item of filteredData(); track item[valueKey()]) {
            <mat-option [value]="item[valueKey()]">
              {{ item[displayKey()] }}
            </mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>

      <div class="min-h-[20px] w-full pt-1 px-4">
        @if (showError()) {
          <mat-error
            class="!text-[12px] sm:!text-[13px] !leading-tight !text-red-600 block w-full
                    line-clamp-1"
            [title]="showError()"
          >
            {{ showError() }}
          </mat-error>
        }
      </div>
    </div>
  `
})
export class AutocompleteComponent {
  // Recebe a lista pronta do pai (ex: cargos())
  data = input.required<any[]>();
  // Configurações visuais
  label = input<string>('Selecione');
  placeholder = input<string>('Digite para pesquisar...');
  displayKey = input<string>('nome'); // Qual campo mostrar?
  valueKey = input<string>('id'); // Qual campo emitir?
  // Two-way binding para o ID selecionado (Substitui o formControl)
  selectedId = model<number | null>(null);

  // Tratamento de Erros vindo do Pai
  hasExternalError = input<boolean>(false);
  errorMessage = input<string | undefined>('');
  externalTouched = input<boolean>(false);

  // Estado interno de toque
  touched = signal(false);
  searchTerm = signal('');

  // Capturamos a referência do input "preguiçoso" do Material
  matInputRef = viewChild(MatInput);
  // Filtra a lista baseada no termo digitado
  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter((item) => item[this.displayKey()]?.toLowerCase().includes(term));
  });
  // Decide se mostra o nome do item selecionado ou o texto digitado
  displayValue = computed(() => {
    const id = this.selectedId();
    if (id !== null && id !== undefined) {
      const item = this.data().find((i) => i[this.valueKey()] === id);
      return item ? item[this.displayKey()] : '';
    }
    return this.searchTerm();
  });
  // Lógica de Erro Inteligente (Encapsulada)
  showError = computed(() => {
    const isTouched = this.touched() || this.externalTouched();

    // Erro 1: Digitou algo, mas não clicou em nada da lista
    if (this.selectedId() === null && this.searchTerm() !== '') {
      return 'Selecione um item válido na lista';
    }
    // Erro 2: Erro do form validator (ex: required) após o campo ser tocado
    if (isTouched && this.hasExternalError()) {
      return this.errorMessage();
    }
    return null;
  });
  // O "Fofoqueiro" que pinta a borda de vermelho
  errorMatcher: ErrorStateMatcher = {
    isErrorState: () => this.showError() !== null
  };

  constructor() {
    effect(() => {
      this.showError();
      this.matInputRef()?.updateErrorState();
    });
  }

  // Eventos do Input
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);

    // Se o usuário voltar a digitar, limpamos o ID para forçar nova escolha
    if (this.selectedId() !== null) {
      this.selectedId.set(null);
    }
  }

  onBlur() {
    this.touched.set(true);
  }

  // Eventos para atualizar o Model e o estado de Toque
  onSelected(value: number) {
    this.selectedId.set(value);
    this.searchTerm.set('');
    this.touched.set(true);
  }
}
