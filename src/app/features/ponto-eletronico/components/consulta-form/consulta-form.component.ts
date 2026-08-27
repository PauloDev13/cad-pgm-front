import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { GeneratePayload, Unidade } from '../../models/ponto-eletronico.model';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';

@Component({
  selector: 'app-consulta-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Dados da consulta</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="cpf">CPF</label>
            <input
              id="cpf"
              formControlName="cpf"
              placeholder="000.000.000-00"
              autocomplete="off"
              inputmode="numeric"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     placeholder:text-gray-400"
            />
            @if (form.get('cpf')?.touched && form.get('cpf')?.invalid) {
              <p class="text-sm text-red-500 mt-1">{{ cpfError() }}</p>
            }
          </div>

          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1" for="unit">Código da Unidade</label>
            <input
              id="unit"
              formControlName="unit"
              placeholder="Busca pelo nome da unidade"
              autocomplete="off"
              (input)="onUnitInput($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     placeholder:text-gray-400"
            />
            @if (unidades().length > 0) {
              <ul class="absolute z-10 mt-1 w-full bg-white border border-blue-500 rounded-lg max-h-48 overflow-y-auto shadow-lg">
                @for (item of unidades(); track item.code) {
                  <li
                    class="px-3 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                    (click)="selectUnidade(item)">
                    {{ item.code }} - {{ item.description }}
                  </li>
                }
              </ul>
            }
            @if (form.get('unit')?.touched && form.get('unit')?.invalid) {
              <p class="text-sm text-red-500 mt-1">Informe o Código da Unidade!</p>
            }
          </div>
        </div>

        <div class="flex flex-wrap items-end gap-4 mb-6">
          <div class="flex-1 min-w-[150px]">
            <label class="block text-sm font-medium text-gray-700 mb-1" for="dateStart">Data Inicial (Mês/Ano)</label>
            <input
              id="dateStart"
              formControlName="dateStart"
              placeholder="Mês/Ano"
              inputmode="numeric"
              (input)="applyMonthYearMask($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     placeholder:text-gray-400"
            />
            @if (form.get('dateStart')?.touched && form.get('dateStart')?.invalid) {
              <p class="text-sm text-red-500 mt-1">{{ dateStartError() }}</p>
            }
          </div>

          <div class="flex-1 min-w-[150px]">
            <label class="block text-sm font-medium text-gray-700 mb-1" for="dateEnd">Data Final (Mês/Ano)</label>
            <input
              id="dateEnd"
              formControlName="dateEnd"
              placeholder="Mês/Ano"
              inputmode="numeric"
              (input)="applyMonthYearMask($event)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     placeholder:text-gray-400"
            />
            @if (form.get('dateEnd')?.touched && form.get('dateEnd')?.invalid) {
              <p class="text-sm text-red-500 mt-1">{{ dateEndError() }}</p>
            }
          </div>

          <div class="flex gap-4 items-center pb-1">
            <label class="flex items-center gap-2 whitespace-nowrap text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" formControlName="excel" class="rounded border-gray-300 text-blue-600" />
              Gerar planilhas
            </label>
            <label class="flex items-center gap-2 whitespace-nowrap text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" formControlName="pdf" class="rounded border-gray-300 text-blue-600" />
              Gerar PDF
            </label>
          </div>
        </div>

        @if (formatError()) {
          <p class="text-sm text-red-500 mb-4">{{ formatError() }}</p>
        }

        <div class="flex gap-4">
          <button
            type="button"
            (click)="onClear()"
            class="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg font-bold shadow-md
                   hover:bg-gray-600 transition-all text-sm">
            LIMPAR CONSULTA
          </button>
          <button
            type="submit"
            [disabled]="store.isGenerating()"
            class="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-md
                   hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            @if (store.isGenerating()) {
              <span class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white/25 border-t-white mr-2 align-middle"></span>
              GERANDO...
            } @else {
              {{ buttonLabel() }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ConsultaFormComponent implements OnInit {
  readonly store = inject(PontoEletronicoStore);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PontoEletronicoService);

  form: FormGroup;
  unidades = signal<Unidade[]>([]);

  private readonly unitSearch$ = new Subject<string>();

  buttonLabel = computed(() => {
    const excel = this.form?.get('excel')?.value ?? true;
    const pdf = this.form?.get('pdf')?.value ?? false;
    if (excel && pdf) return 'GERAR PLANILHAS E ARQUIVO PDF';
    if (excel) return 'GERAR PLANILHAS';
    if (pdf) return 'GERAR ARQUIVO PDF';
    return 'GERAR ARQUIVO';
  });

  cpfError = signal('');
  dateStartError = signal('');
  dateEndError = signal('');
  formatError = signal('');

  constructor() {
    this.form = this.fb.group({
      cpf: ['', Validators.required],
      unit: ['', Validators.required],
      dateStart: ['', Validators.required],
      dateEnd: ['', Validators.required],
      excel: [true],
      pdf: [false],
    });
  }

  ngOnInit(): void {
    this.unitSearch$
      .pipe(
        debounceTime(250),
        switchMap((q) => this.service.searchUnidades(q))
      )
      .subscribe({
        next: (res) => {
          if (res.ok) {
            this.unidades.set(res.results);
          } else {
            this.unidades.set([]);
          }
        },
        error: () => this.unidades.set([]),
      });

    this.form.get('excel')?.valueChanges.subscribe(() => this.formatError.set(''));
    this.form.get('pdf')?.valueChanges.subscribe(() => this.formatError.set(''));
  }

  onUnitInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (value.length < 2) {
      this.unidades.set([]);
      return;
    }
    this.unitSearch$.next(value);
  }

  selectUnidade(item: Unidade): void {
    this.form.get('unit')?.setValue(item.code);
    this.unidades.set([]);
  }

  applyMonthYearMask(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 6);
    if (digits.length > 4) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2);
    } else if (digits.length > 2) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    input.value = digits;
    const control = input.id === 'dateStart' ? 'dateStart' : 'dateEnd';
    this.form.get(control)?.setValue(digits, { emitEvent: false });
  }

  cpfErrorText(): string {
    const ctrl = this.form.get('cpf');
    if (!ctrl?.touched || !ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'O CPF é obrigatório!';
    return 'CPF inválido!';
  }

  dateStartErrorText(): string {
    const ctrl = this.form.get('dateStart');
    if (!ctrl?.touched || !ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'Data Inicial é obrigatório!';
    return 'Data inválida!';
  }

  dateEndErrorText(): string {
    const ctrl = this.form.get('dateEnd');
    if (!ctrl?.touched || !ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'Data Final é obrigatório!';
    return 'Data inválida!';
  }

  onSubmit(): void {
    this.cpfError.set('');
    this.dateStartError.set('');
    this.dateEndError.set('');
    this.formatError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cpfError.set(this.cpfErrorText());
      this.dateStartError.set(this.dateStartErrorText());
      this.dateEndError.set(this.dateEndErrorText());
      return;
    }

    const excel = this.form.get('excel')?.value;
    const pdf = this.form.get('pdf')?.value;
    if (!excel && !pdf) {
      this.formatError.set('Escolha pelo menos um tipo de arquivo a ser gerado!');
      return;
    }

    const payload: GeneratePayload = {
      cpf: this.form.get('cpf')?.value.replace(/\D/g, ''),
      unit: this.form.get('unit')?.value.trim(),
      dateStart: this.form.get('dateStart')?.value.trim(),
      dateEnd: this.form.get('dateEnd')?.value.trim(),
      excel,
      pdf,
    };

    this.submitPayload.emit(payload);
  }

  onClear(): void {
    this.form.reset({ cpf: '', unit: '', dateStart: '', dateEnd: '', excel: true, pdf: false });
    this.cpfError.set('');
    this.dateStartError.set('');
    this.dateEndError.set('');
    this.formatError.set('');
    this.unidades.set([]);
    this.clearEvent.emit();
  }

  readonly submitPayload = new Subject<GeneratePayload>();
  readonly clearEvent = new Subject<void>();
}
