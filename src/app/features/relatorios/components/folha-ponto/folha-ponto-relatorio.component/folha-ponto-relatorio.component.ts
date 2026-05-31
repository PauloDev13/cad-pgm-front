import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RelatorioService } from '../../../services/relatorio.service';
import { CalendarUtils } from '../../../utils/calendar-utils';
import { MESES_DO_ANO } from '../../../models/aniversariente.model';
import { ErrorHandlerService } from '../../../../../shared/service/error-handler.service';
import { CommonModule, Location } from '@angular/common';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../shared/components/loading.component/loading.component';

@Component({
  selector: 'app-folha-ponto-relatorio.component',
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatButtonModule, LoadingComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative flex flex-col w-full h-[calc(100vh-100px)] min-h-[600px] overflow-hidden bg-gray-50/50
             print:h-auto print:bg-white print:block"
      style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">

      <div
        class="absolute inset-0 z-50 bg-white/60 flex justify-center items-center backdrop-blur-sm
                    transition-opacity duration-300"
        [class.opacity-0]="!isLoading()"
        [class.opacity-100]="isLoading()"
        [class.pointer-events-none]="!isLoading()">
        <app-loading [isLoading]="true" />
      </div>

      <div class="shrink-0 mb-6 print:hidden px-2 md:px-0 pt-6 flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div class="flex justify-between w-full">
          <button
            class="bg-gray-500 text-white px-4 md:px-6 py-2 rounded-lg font-bold shadow-md
                 hover:bg-gray-600 hover:shadow-lg transition-all flex items-center gap-2"
            (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            <span class="hidden sm:inline">Voltar</span>
          </button>

          <button
            class="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold shadow-md
                 hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2"
            (click)="printReport()">
            <mat-icon>print</mat-icon>
            <span class="hidden sm:inline">Imprimir/Salvar</span>
          </button>
        </div>
        <h2 class="text-center text-lg md:text-xl font-bold text-gray-700 uppercase tracking-wide m-0">
          SETOR: <span
          class="text-blue-700">{{ nomeSetor() }}{{ totalServidoresSetor() }}</span>
        </h2>
      </div>

      <div
        class="flex-1 min-h-0 overflow-y-auto w-full max-w-4xl mx-auto px-2 md:px-0 pb-8 print:p-0
               print:overflow-visible print:max-w-none">

        @for (servidor of servidores(); track $index; let isLast = $last) {

          <div class="w-full p-6 md:p-10 bg-white text-black font-sans text-xs md:text-sm
               shadow-sm rounded-xl border border-gray-200 mb-10 print:w-full print:m-0 print:p-0
               print:border-none print:shadow-none print:rounded-none break-inside-avoid"
               [class.break-after-page]="!isLast">

            <div class="mb-4 font-bold uppercase tracking-wide leading-tight
                    bg-gray-50 border border-gray-300 p-4 rounded-lg print:mb-2">

              <div class="flex items-center justify-between border-b-2 border-black pb-1 mb-2">
                <span class="text-xl">NOME: {{ servidor.nome }}</span>
                <span class="print:text-[14px] text-[18px]">
                  MÊS: {{ nomeMesCorrente() }}/{{ anoSelecionado() }}
                </span>
              </div>

              <div class="flex flex-col gap-1.5 mt-2">
                <div>VÍNCULO: {{ servidor.vinculo }}</div>
                <div>FORMA DE TRABALHO: {{ servidor.formaTrabalho }}</div>
                <div>LOTAÇÃO: {{ servidor.setor }}</div>
              </div>
            </div>

            <table class="w-full border-collapse border-2 border-black text-center table-fixed bg-white">
              <thead>
              <tr class="bg-gray-200">
                <th class="border border-black py-1 px-2 w-[8%]">DIA</th>
                <th class="border border-black py-1 px-2 w-[28%]">HORÁRIO DE ENTRADA</th>
                <th class="border border-black py-1 px-2 w-[28%]">HORÁRIO DE SAÍDA</th>
                <th class="border border-black py-1 px-2 w-[36%]">ASSINATURAS</th>
              </tr>
              </thead>
              <tbody>
                @for (dia of diasDaFolha(); track dia.dia) {

                  <tr class="h-[32px] print:h-[28px]">

                    <td class="border border-black px-1 font-bold">{{ dia.dia | number:'2.0' }}</td>

                    @if (dia.tipo === 'NORMAL') {
                      <td class="border border-black px-1"></td>
                      <td class="border border-black px-1"></td>
                      <td class="border border-black px-1"></td>
                    } @else if (dia.tipo === 'FERIADO') {
                      <td class="border border-black px-1 font-bold bg-gray-100 text-gray-700" colspan="3">
                        {{ dia.nomeFeriado | uppercase }}
                      </td>
                      <td class="border border-black px-1 text-center bg-gray-100 text-gray-700">-</td>
                    } @else {
                      <td class="border border-black px-1 font-bold bg-gray-100 text-gray-700">
                        {{ dia.tipo }}
                      </td>
                      <td class="border border-black px-1 font-bold bg-gray-100 text-gray-700">
                        {{ dia.tipo }}
                      </td>
                      <td class="border border-black px-1 text-center bg-gray-100 text-gray-700">-</td>
                    }
                  </tr>
                }
              </tbody>
            </table>

          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    @media print {
      .no-print {
        display: none !important;
      }

      .folha-ponto-container {
        break-after: page;
        page-break-after: always;
      }

      @page {
        margin: 1.5cm;
      }
    }
  `]
})
export default class FolhaPontoRelatorioComponent {
  private relatorioService = inject(RelatorioService);
  private errorHandlerService = inject(ErrorHandlerService);
  private readonly route = inject(ActivatedRoute);
  private location = inject(Location);

  private queryParams = toSignal((this.route.queryParams));

  mesSelecionado = computed(() => {
    const mes = this.queryParams()?.['mes'];
    return mes ? Number(mes) : 1;
  });

  anoSelecionado = computed(() => {
    const ano = this.queryParams()?.['ano'];
    return ano ? Number(ano) : 2026;
  });

  setorId = computed(() => {
    const setorId = this.queryParams()?.['setorId'];
    return setorId ? Number(setorId) : null;
  });

  diasDaFolha = computed(() =>
    CalendarUtils.gerarDiasDoMes(this.anoSelecionado(), this.mesSelecionado())
  );

  nomeMesCorrente = computed(() => {
    const mesObj = MESES_DO_ANO.find(
      m => m.id === this.mesSelecionado());
    return mesObj ? mesObj.nome.toUpperCase() : '';
  });

  nomeSetor = computed(() => {
    const lista = this.servidores();
    return lista.length > 0 ? lista[0].setor : '';
  });

  totalServidoresSetor = computed(() => {
    const lista = this.servidores();
    return lista.length > 1
      ? ` - TOTAL DE ${lista.length} Servidores`
      : ` - TOTAL DE ${lista.length} Servidor`;
  });

  folhaPontoResource = rxResource({
    params: () => {
      return {
        setorId: this.setorId(),
        mes: this.mesSelecionado(),
        ano: this.anoSelecionado()
      };
    },
    stream: ({ params }) => {
      if (!params.setorId || isNaN(params.setorId)) {
        return of([]);
      }

      return this.relatorioService.gerarFolhaMes(params.setorId);
    }
  });


  servidores = computed(() => {
    return this.folhaPontoResource.value() ?? [];
  });

  isLoading = this.folhaPontoResource.isLoading;

  constructor() {
    effect(() => {
      const error = this.folhaPontoResource.error();
      if (error) {
        this.errorHandlerService.handle(error, 'Folha Ponto');
      }
    });
  }

  printReport() {
    window.print();
  }

  // Método para o botão Voltar
  goBack() {
    this.location.back();
  }
}
