import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormValueControl } from '@angular/forms/signals';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-custom-autocomplete',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  standalone: true,
  styles: `
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }

    .custom-autocomplete-container {
      display: flex;
      position: relative;
      width: 100%;
      min-width: 0;

      .custom-autocomplete-field {
        width: 100%;

        &.is-disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }
    }

    ::ng-deep .custom-autocomplete-panel {
      border-radius: 0.75rem !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
      border: 1px solid #e2e8f0;
      max-height: 280px !important;
    }
  `,

  template: `
    <div class="custom-autocomplete-container w-full flex flex-col">
      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="w-full custom-autocomplete-field"
        [class.is-disabled]="isDisabled()"
      >
        @if (label()) {
          <mat-label>{{ label() }}</mat-label>
        }

        <input
          #trigger="matAutocompleteTrigger"
          #inputElement
          type="text"
          matInput
          [errorStateMatcher]="errorStateMatcher"
          [matAutocomplete]="autoPanel"
          [attr.aria-invalid]="invalid()"
          [disabled]="isDisabled()"
          [placeholder]="placeholder()"
          [value]="displayValue()"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
          (click)="inputElement.select(); openPanelOnClick()"
          (focus)="inputElement.select()"
          autocomplete="off"
        />

        <!-- Sufixo com Botão de Limpar e Seta Dropdown -->
        <div matSuffix class="flex items-center gap-0.5 pr-1">
          <!-- Botão Limpar Seleção -->
          @if (clearable() && value() !== null && value() !== undefined && value() !== '' && !isDisabled()) {
            <button
              mat-icon-button
              type="button"
              tabindex="-1"
              matTooltip="Limpar seleção"
              aria-label="Limpar seleção"
              (click)="clearSelection($event)"
              class="!w-7 !h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
            >
              <mat-icon class="!text-lg !font-bold !text-red-700 !leading-none">close</mat-icon>
            </button>
          }

          <!-- Ícone Indicador de Dropdown -->
          <button
            mat-icon-button
            type="button"
            tabindex="-1"
            [disabled]="isDisabled()"
            (mousedown)="$event.preventDefault(); togglePanel(trigger)"
            class="!w-7 !h-7 flex items-center justify-center text-slate-500 transition-transform duration-200"
            [class.rotate-180]="trigger.panelOpen"
            aria-label="Alternar opções"
          >
            <mat-icon class="!text-xl !leading-none">arrow_drop_down</mat-icon>
          </button>
        </div>

        <!-- Painel de Sugestões / Opções -->
        <mat-autocomplete
          #autoPanel="matAutocomplete"
          class="custom-autocomplete-panel"
          (optionSelected)="onOptionSelected($event)"
        >
          <!-- Opção Nula / Desfazer Filtro (se configurado) -->
          @if (emptyOptionLabel()) {
            <mat-option [value]="null" class="!text-red-700 italic font-normal">
              {{ emptyOptionLabel() }}
            </mat-option>
          }

          <!-- Opções Filtradas Dinamicamente -->
          @for (item of filteredOptions(); track getItemValue(item)) {
            <mat-option
              [value]="getItemValue(item)"
              [class.!bg-blue-50]="getItemValue(item) === value()"
              [class.!font-semibold]="getItemValue(item) === value()"
              class="hover:!bg-blue-50/50 transition-colors !font-semibold !text-blue-700 text-sm"
            >
              {{ getItemDisplayText(item) }}
            </mat-option>
          }

          <!-- Estado Vazio -->
          @if (filteredOptions().length === 0) {
            <mat-option class="!text-red-500 italic text-sm">
              Nenhum resultado encontrado
            </mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CustomAutocompleteComponent<T = any> implements FormValueControl<any> {
  /** Lista completa de itens para exibição e filtragem */
  options = input.required<T[]>();

  /** Rótulo do campo (mat-label) */
  label = input<string>('');

  /** Placeholder do campo de texto */
  placeholder = input<string>('Selecione ou digite para pesquisar...');

  /** Nome do atributo a ser exibido no input e nas opções (ex: 'nome', 'rotulo') */
  displayKey = input<string>('nome');

  /** Nome do atributo cujo valor será emitido / armazenado (ex: 'id', 'codigo') */
  valueKey = input<string>('id');

  enabledKey = input<string>('ativo');

  /** Função customizada de formatação de exibição (opcional, sobrepõe displayKey) */
  displayFnCustom = input<((item: T) => string) | null>(null);

  /** Se exibe botão de limpar o campo com 1 clique */
  clearable = input<boolean>(true);

  /** Estado de desabilitado */
  disabled = input<boolean>(false);

  /** Texto da opção nula / desmarcar filtro (opcional) */
  emptyOptionLabel = input<string | null>(null);

  /** Two-way binding reativo para o valor selecionado (usado diretamente em filtros) */
  value = model<any>(null);

  /** Evento emitido na seleção ou limpeza de um valor */
  selectionChange = output<any>();

  // ==============================================================
  // ESTADOS INTERNOS
  // ==============================================================

  /** Termo de pesquisa digitado pelo usuário */
  searchTerm = signal<string>('');

  /** Estado de validação recebido automaticamente do Signal Forms */
  invalid = input<boolean>(false);

  /** Sinal que indica se o campo foi tocado (interação do usuário) */
  touched = model<boolean>(false);

  /** Referência ao elemento de input Material */
  matInputRef = viewChild(MatInput);
  autocompleteTrigger = viewChild(MatAutocompleteTrigger);
  matAutocomplete = viewChild(MatAutocomplete);
  // =========================================================================
  /** Indica se o componente está desabilitado por qualquer origem */
  isDisabled = computed(() => this.disabled());

  // =========================================================================
  // LÓGICA COMPUTADA
  // =========================================================================

  /**
   * Lista de registros habilitados para exibição.
   * Elimina todos os registros cujo atributo booleano seja diferente de true.
   */
  availableOptions = computed<T[]>(() => {
    return (this.options() || []).filter(item => this.isItemEnabled(item));
  });


  readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: () => this.invalid() && this.touched()
  };

  /** Lista filtrada em tempo real com base no termo de busca e normalização de acentos */
  filteredOptions = computed(() => {
    const list = this.availableOptions() || [];
    const term = this.normalizeText(this.searchTerm().trim());

    if (!term) {
      return list;
    }

    return list.filter((item) => {
      const text = this.getItemDisplayText(item);
      return this.normalizeText(text).includes(term);
    });
  });

  /** Texto exibido atualmente no input */
  displayValue = computed(() => {
    const currentVal = this.value();

    if (currentVal !== null && currentVal !== undefined && currentVal !== '') {
      const found = (this.availableOptions() || []).find(
        (item) => this.getItemValue(item) === currentVal
      );
      if (found) {
        return this.getItemDisplayText(found);
      }
    }
    return this.searchTerm();
  });
  /** Timeout de controle para resolução do blur */
  private blurTimeout: any = null;

  constructor() {
    // Sincroniza o texto do input sempre que o valor externo ou a lista de opções mudar
    effect(() => {
      const currentVal = this.value();
      const opts = this.availableOptions();

      if (currentVal === null || currentVal === undefined || currentVal === '') {
        this.searchTerm.set('');
      } else {
        const found = opts.find((item) => this.getItemValue(item) === currentVal);
        if (found) {
          this.searchTerm.set('');
        }
      }
    });

    // Efeito para sincronizar o estado de erro com o Angular Material
    effect(() => {
      // Registramos as dependências ativamente
      const isInvalid = this.invalid();
      const isTouched = this.touched();

      // Quando qualquer um desses signals mudar, forçamos o matInput a reavaliar o ErrorStateMatcher
      const inputRef = this.matInputRef();
      if (inputRef) {
        inputRef.updateErrorState();
      }
    });
  }

  /**
   * Função fornecida ao [displayWith] do mat-autocomplete
   */
  /**formatDisplayFn = (val: any): string => {
   if (val === null || val === undefined || val === '') return '';
   const found = (this.availableOptions() || []).find((item) => this.getItemValue(item) === val);
   return found ? this.getItemDisplayText(found) : '';
   };*/

  // =========================================================================
  // MÉTODOS AUXILIARES
  // =========================================================================

  getItemDisplayText(item: T): string {
    if (!item) return '';

    if (this.displayFnCustom()) {
      return this.displayFnCustom()!(item);
    }
    return (item as any)[this.displayKey()] ?? '';
  }

  getItemValue(item: T): any {
    if (!item) return null;
    return (item as any)[this.valueKey()] ?? null;
  }

  /**
   * Alterna a abertura e fechamento do painel utilizando a API oficial do Angular Material
   */
  togglePanel(trigger: MatAutocompleteTrigger) {
    if (this.isDisabled()) return;
    if (trigger.panelOpen) {
      trigger.closePanel();
    } else {
      trigger.openPanel();
    }
  }

  onInputChange(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    this.searchTerm.set(text);

    // Se o usuário apagar completamente o texto manualmente, limpa o valor
    if (text.trim() === '' && this.value() !== null) {
      this.updateValue(null);
    }
  }

  /**
   * Disparado quando o usuário clica em uma opção da lista
   */
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    // Cancela qualquer timeout pendente do blur para evitar reset prematuro
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }

    const selectedVal = event.option.value;
    this.updateValue(selectedVal);
    this.searchTerm.set('');
    this.markAsTouched();
  }

  // =========================================================================
  // MANIPULAÇÃO DE EVENTOS
  // =========================================================================

  /**
   * Manipula a perda de foco do input de forma assíncrona,
   * permitindo que o evento de clique na opção aconteça sem concorrência
   */
  onBlur() {
    // this.markAsTouched();
    this.touched.set(true);

    // Cancela execução anterior se houver
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }

    // Aguarda o término do ciclo de eventos de clique/seleção
    this.blurTimeout = setTimeout(() => {
      const currentVal = this.value();

      if (currentVal !== null && currentVal !== undefined && currentVal !== '') {
        const found = (this.availableOptions() || []).find(
          (item) => this.getItemValue(item) === currentVal
        );

        if (found) {
          this.searchTerm.set('');
          return;
        }
      }
      // Se não há valor válido selecionado, descarta o texto digitado solto
      this.searchTerm.set('');
      this.blurTimeout = null;
    }, 500);
  }

  clearSelection(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.updateValue(null);
    this.clearMaterialSelection();
    this.searchTerm.set('');
    this.markAsTouched();
    this.matInputRef()?.focus();
  }

  openPanelOnClick() {
    if (!this.isDisabled()) {
      this.autocompleteTrigger()?.openPanel();
    }
  }

  private isItemEnabled(item: T): boolean {
    if (item === null || item === undefined || typeof item !== 'object') {
      return false;
    }

    const record = item as unknown as Record<string, unknown>;

    return record[this.enabledKey()] === true;
  }

  // =========================================================================
  // CONTROL VALUE ACCESSOR (CVA)
  // =========================================================================

  /**
   * Remove o estado interno de seleção de todas as opções
   * do Angular Material.
   */
  private clearMaterialSelection(): void {
    this.matAutocomplete()?.options.forEach(option => {
      if (option.selected) {
        option.deselect(false);
      }
    });
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private updateValue(newVal: any) {
    this.value.set(newVal);
    this.selectionChange.emit(newVal);
  }

  private markAsTouched() {
    if (!this.touched()) {
      this.touched.set(true);
    }
  }
}
