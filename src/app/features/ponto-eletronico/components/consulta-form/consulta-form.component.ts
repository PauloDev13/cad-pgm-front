import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';
import { GeneratePayload, Unidade } from '../../models/ponto-eletronico.model';
import { debounceTime, Subject, switchMap } from 'rxjs';

interface ConsultaFormModel {
  cpf: string;
  unit: string;
  dateStart: string;
  dateEnd: string;
  excel: boolean;
  pdf: boolean;
}

@Component({
  selector: 'app-consulta-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormField,
    FieldWrapperComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-medium text-gray-800 mb-5">Dados da consulta</h2>

      <form (submit)="onSubmit($event)" autocomplete="off" class="flex flex-col">
        <!-- Linha 1: CPF + Unidade -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-4">
          <!-- CPF -->
          <app-field-wrapper [field]="consultaForm.cpf()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>CPF</mat-label>
              <input
                matInput
                [formField]="consultaForm.cpf"
                placeholder="000.000.000-00"
                autocomplete="off"
                inputmode="numeric"
                (input)="applyCpfMask($event)"
              />
            </mat-form-field>
          </app-field-wrapper>

          <!-- Unidade (autocomplete) -->
          <div class="relative" #unitWrapper>
            <app-field-wrapper [field]="consultaForm.unit()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>C\u00f3digo da Unidade</mat-label>
                <input
                  matInput
                  [formField]="consultaForm.unit"
                  placeholder="Busca pelo nome da unidade"
                  autocomplete="off"
                  (input)="onUnitInput($event)"
                />
              </mat-form-field>
            </app-field-wrapper>

            @if (unidades().length > 0) {
              <ul class="absolute z-20 mt-[-8px] w-[calc(100%-24px)] mx-3 bg-white border border-blue-500 rounded-lg max-h-48 overflow-y-auto shadow-lg">
                @for (item of unidades(); track item.code) {
                  <li
                    class="px-3 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    (mousedown)="selectUnidade(item)">
                    {{ item.code }} - {{ item.description }}
                  </li>
                }
              </ul>
            }
          </div>
        </div>

        <!-- Linha 2: Datas + Checkboxes -->
        <div class="flex flex-wrap items-end gap-4 mb-6">
          <div class="flex-1 min-w-[150px]">
            <app-field-wrapper [field]="consultaForm.dateStart()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Data Inicial (M\u00eas/Ano)</mat-label>
                <input
                  matInput
                  [formField]="consultaForm.dateStart"
                  placeholder="M\u00eas/Ano"
                  inputmode="numeric"
                  (input)="applyMonthYearMask($event, 'dateStart')"
                />
              </mat-form-field>
            </app-field-wrapper>
          </div>

          <div class="flex-1 min-w-[150px]">
            <app-field-wrapper [field]="consultaForm.dateEnd()">
              <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
                <mat-label>Data Final (M\u00eas/Ano)</mat-label>
                <input
                  matInput
                  [formField]="consultaForm.dateEnd"
                  placeholder="M\u00eas/Ano"
                  inputmode="numeric"
                  (input)="applyMonthYearMask($event, 'dateEnd')"
                />
              </mat-form-field>
            </app-field-wrapper>
          </div>

          <div class="flex gap-5 items-center pb-2">
            <label class="flex items-center gap-2 whitespace-nowrap text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                [checked]="consultaFormModel().excel"
                (change)="toggleExcel()"
                class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Gerar planilhas
            </label>
            <label class="flex items-center gap-2 whitespace-nowrap text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                [checked]="consultaFormModel().pdf"
                (change)="togglePdf()"
                class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Gerar PDF
            </label>
          </div>
        </div>

        @if (formatError()) {
          <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
            {{ formatError() }}
          </div>
        }

        <!-- Bot\u00f5es -->
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
            [disabled]="consultaForm().invalid() || store.isGenerating()"
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
export class ConsultaFormComponent {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);

  @ViewChild('unitWrapper') unitWrapper!: ElementRef<HTMLElement>;

  unidades = signal<Unidade[]>([]);
  formatError = signal('');

  private readonly unitSearch$ = new Subject<string>();

  private readonly initialModel: ConsultaFormModel = {
    cpf: '',
    unit: '',
    dateStart: '',
    dateEnd: '',
    excel: true,
    pdf: false,
  };

  consultaFormModel = signal<ConsultaFormModel>({ ...this.initialModel });

  consultaForm = form(this.consultaFormModel, (path) => {
    required(path.cpf, { message: 'O CPF \u00e9 obrigat\u00f3rio!' });
    required(path.unit, { message: 'Informe o C\u00f3digo da Unidade!' });
    required(path.dateStart, { message: 'Data Inicial \u00e9 obrigat\u00f3rio!' });
    required(path.dateEnd, { message: 'Data Final \u00e9 obrigat\u00f3rio!' });
  });

  buttonLabel = computed(() => {
    const { excel, pdf } = this.consultaFormModel();
    if (excel && pdf) return 'GERAR PLANILHAS E ARQUIVO PDF';
    if (excel) return 'GERAR PLANILHAS';
    if (pdf) return 'GERAR ARQUIVO PDF';
    return 'GERAR ARQUIVO';
  });

  constructor() {
    this.unitSearch$
      .pipe(
        debounceTime(250),
        switchMap((q) => this.service.searchUnidades(q))
      )
      .subscribe({
        next: (res) => this.unidades.set(res.ok ? res.results : []),
        error: () => this.unidades.set([]),
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const wrapper = this.unitWrapper?.nativeElement;
    if (wrapper && !wrapper.contains(target)) {
      this.unidades.set([]);
    }
  }

  applyCpfMask(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);
    if (digits.length > 9) {
      digits = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9);
    } else if (digits.length > 6) {
      digits = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6);
    } else if (digits.length > 3) {
      digits = digits.slice(0, 3) + '.' + digits.slice(3);
    }
    input.value = digits;
    this.consultaFormModel.update((m) => ({ ...m, cpf: digits }));
  }

  applyMonthYearMask(event: Event, field: 'dateStart' | 'dateEnd'): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 6);
    if (digits.length > 2) {
      digits = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    input.value = digits;
    this.consultaFormModel.update((m) => ({ ...m, [field]: digits }));
  }

  onUnitInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.consultaFormModel.update((m) => ({ ...m, unit: value }));
    if (value.length < 2) {
      this.unidades.set([]);
      return;
    }
    this.unitSearch$.next(value);
  }

  selectUnidade(item: Unidade): void {
    this.consultaFormModel.update((m) => ({ ...m, unit: item.code }));
    this.unidades.set([]);
  }

  toggleExcel(): void {
    this.consultaFormModel.update((m) => ({ ...m, excel: !m.excel }));
    if (this.formatError()) this.formatError.set('');
  }

  togglePdf(): void {
    this.consultaFormModel.update((m) => ({ ...m, pdf: !m.pdf }));
    if (this.formatError()) this.formatError.set('');
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.formatError.set('');

    const { excel, pdf } = this.consultaFormModel();
    if (!excel && !pdf) {
      this.formatError.set('Escolha pelo menos um tipo de arquivo a ser gerado!');
      return;
    }

    await submit(this.consultaForm, async () => {
      const raw = this.consultaForm().controlValue();
      const payload: GeneratePayload = {
        cpf: raw.cpf.replace(/\D/g, ''),
        unit: raw.unit.trim(),
        dateStart: raw.dateStart.trim(),
        dateEnd: raw.dateEnd.trim(),
        excel: raw.excel,
        pdf: raw.pdf,
      };
      this.submitPayload.next(payload);
    });
  }

  onClear(): void {
    this.consultaFormModel.set({ ...this.initialModel });
    this.formatError.set('');
    this.unidades.set([]);
    this.clearEvent.next();
  }

  readonly submitPayload = new Subject<GeneratePayload>();
  readonly clearEvent = new Subject<void>();
}
