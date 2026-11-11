import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomAutocompleteComponent),
      multi: true
    }
  ],
  standalone: true,
  styles: `
    .custom-autocomplete-container {
      display: flex;
      position: relative;
      width: 100%;

      .custom-autocomplete-field {
        width: 100%;

        ::ng-deep .mat-mdc-form-field-infix {
          padding-top: 10px !important;
          padding-bottom: 10px !important;
          /*min-height: 45px;*/
        }

        ::ng-deep .mat-mdc-text-field-wrapper {
          background-color: transparent !important;
        }

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

      .mat-mdc-option {
        min-height: 40px !important;
        font-size: 0.875rem !important;

        &.mat-mdc-option-active {
          background-color: #eff6ff !important;
          color: #1d4ed8 !important;
        }
      }
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
          [disabled]="isDisabled()"
          [placeholder]="placeholder()"
          [matAutocomplete]="autoPanel"
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
              <mat-icon class="!text-lg !leading-none">close</mat-icon>
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
            <mat-option [value]="null" class="text-gray-400 italic font-normal">
              {{ emptyOptionLabel() }}
            </mat-option>
          }

          <!-- Opções Filtradas Dinamicamente -->
          @for (item of filteredOptions(); track getItemValue(item)) {
            <mat-option
              [value]="getItemValue(item)"
              [class.!bg-blue-50]="getItemValue(item) === value()"
              [class.!font-semibold]="getItemValue(item) === value()"
              class="hover:!bg-blue-50/50 transition-colors text-sm"
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
export class CustomAutocompleteComponent<T = any> implements ControlValueAccessor {
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

  /** Sinal que indica se o campo foi tocado (interação do usuário) */
  touched = signal<boolean>(false);

  /** Desabilitação gerenciada via ControlValueAccessor */
  cvaDisabled = signal<boolean>(false);

  /** Referência ao elemento de input Material */
  matInputRef = viewChild(MatInput);
  autocompleteTrigger = viewChild(MatAutocompleteTrigger);

  /** Timeout de controle para resolução do blur */
  private blurTimeout: any = null;

  // =========================================================================
  // LÓGICA COMPUTADA
  // =========================================================================
  /** Indica se o componente está desabilitado por qualquer origem */
  isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  /** Lista filtrada em tempo real com base no termo de busca e normalização de acentos */
  filteredOptions = computed(() => {
    const list = this.options() || [];
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
      const found = (this.options() || []).find(
        (item) => this.getItemValue(item) === currentVal
      );
      if (found) {
        return this.getItemDisplayText(found);
      }
    }
    return this.searchTerm();
  });

  constructor() {
    // Sincroniza o texto do input sempre que o valor externo ou a lista de opções mudar
    effect(() => {
      const currentVal = this.value();
      const opts = this.options();

      if (currentVal === null || currentVal === undefined || currentVal === '') {
        this.searchTerm.set('');
      } else {
        const found = opts.find((item) => this.getItemValue(item) === currentVal);
        if (found) {
          this.searchTerm.set('');
        }
      }
    });
  }

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
   * Função fornecida ao [displayWith] do mat-autocomplete
   */
  formatDisplayFn = (val: any): string => {
    if (val === null || val === undefined || val === '') return '';
    const found = (this.options() || []).find((item) => this.getItemValue(item) === val);
    return found ? this.getItemDisplayText(found) : '';
  };

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // =========================================================================
  // MANIPULAÇÃO DE EVENTOS
  // =========================================================================

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
    // Se o usuário apagar todo o texto manualmente, limpa o valor
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

  /**
   * Manipula a perda de foco do input de forma assíncrona,
   * permitindo que o evento de clique na opção aconteça sem concorrência
   */
  onBlur() {
    this.markAsTouched();

    // Cancela execução anterior se houver
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }

    // Aguarda o término do ciclo de eventos de clique/seleção
    this.blurTimeout = setTimeout(() => {
      const currentVal = this.value();
      if (currentVal !== null && currentVal !== undefined && currentVal !== '') {
        const found = (this.options() || []).find(
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
    }, 150);
  }

  clearSelection(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.updateValue(null);
    this.searchTerm.set('');
    this.markAsTouched();
    this.matInputRef()?.focus();
  }

  openPanelOnClick() {
    if (!this.isDisabled()) {
      this.autocompleteTrigger()?.openPanel();
    }
  }

  private updateValue(newVal: any) {
    this.value.set(newVal);
    this.onChange(newVal);
    this.selectionChange.emit(newVal);
  }

  private markAsTouched() {
    if (!this.touched()) {
      this.touched.set(true);
      this.onTouched();
    }
  }

  // =========================================================================
  // CONTROL VALUE ACCESSOR (CVA)
  // =========================================================================

  private onChange: (value: any) => void = () => {
  };
  private onTouched: () => void = () => {
  };

  writeValue(val: any): void {
    this.value.set(val);
    this.searchTerm.set('');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
