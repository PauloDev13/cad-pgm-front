import { Component, computed, input, model, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';

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
    MatLabel,
  ],
  standalone: true,
  template: `
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
      />

      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSelected($event.option.value)">
        @for (item of filteredData(); track item[valueKey()]) {
          <mat-option [value]="item[valueKey()]">
            {{ item[displayKey()] }}
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>

    @if (showError()) {
      <mat-error class="!text-[12px]">{{ showError() }}</mat-error>
    }
  `,
  styles: ``,
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
  // Recebe o status de erro do form validation do pai
  hasExternalError = input<boolean>(false);
  errorMessage = input<string | undefined>('');
  // Sinais internos (O que antes sujava o seu CadFormComponent)
  searchTerm = signal('');
  touched = signal(false);
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
    // Erro 1: Digitou algo, mas não clicou em nada da lista
    if (this.selectedId() === null && this.searchTerm() !== '') {
      return 'Selecione um item válido na lista';
    }
    // Erro 2: Erro do form validator (ex: required) após o campo ser tocado
    if (this.touched() && this.hasExternalError()) {
      return this.errorMessage();
    }
    return null;
  });

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

  onSelected(value: number) {
    this.selectedId.set(value);
    this.searchTerm.set('');
    this.touched.set(true);
  }
}
