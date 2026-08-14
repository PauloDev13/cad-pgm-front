import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RelatorioService } from '../../../services/relatorio.service';
import { CalendarUtils } from '../../../utils/calendar-utils';
import { MESES_DO_ANO } from '../../../models/aniversariente.model';
import { ErrorHandlerService } from '../../../../../shared/service/error-handler.service';
import { CommonModule, Location } from '@angular/common';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
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
      class="relative flex flex-col w-full h-[calc(100dvh-100px)] min-h-0 overflow-hidden bg-gray-50/50
         print:h-auto print:bg-white print:block"
      style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">

      <div
        class="absolute inset-0 z-50 bg-white/60 flex justify-center items-center backdrop-blur-sm transition-opacity duration-300"
        [class.opacity-0]="!isLoading()"
        [class.opacity-100]="isLoading()"
        [class.pointer-events-none]="!isLoading()">
        <app-loading [isLoading]="true" />
      </div>

      <div class="shrink-0 mb-4 print:hidden px-2 md:px-0 pt-6 flex flex-col gap-4 w-full max-w-4xl mx-auto">
        <div class="flex justify-between w-full">
          <button
            class="bg-gray-500 text-white px-4 md:px-6 py-2 rounded-lg font-bold shadow-md hover:bg-gray-600 hover:shadow-lg transition-all flex items-center gap-2"
            (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            <span class="hidden sm:inline">Voltar</span>
          </button>

          <button
            class="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2"
            (click)="printReport()">
            <mat-icon>print</mat-icon>
            <span class="hidden sm:inline">Imprimir/Salvar</span>
          </button>
        </div>
        <h2 class="text-center text-lg md:text-xl font-bold text-gray-700 uppercase tracking-wide m-0">
          EMISSÃO EM LOTE DE FOLHA DE PONTO
        </h2>
      </div>

      <div
        class="flex-1 min-h-0 overflow-y-auto w-full max-w-4xl mx-auto px-2 md:px-0 pb-8 print:p-0
           print:overflow-visible print:max-w-none">

        @if (!isLoading() && setores().length === 0) {
          <div class="flex flex-col flex-1 justify-center items-center p-10 text-gray-400 gap-3 text-center">
            <mat-icon class="text-5xl !text-gray-300">event_busy</mat-icon>
            <p class="text-base md:text-lg font-medium">
              Nenhum dado encontrado para a folha de ponto de {{ nomeMesCorrente() }}/{{ anoSelecionado() }}.
            </p>
          </div>
        }

        @for (setor of setores(); track setor.nomeSetor; let isLastSetor = $last) {

          <!-- Folha de rosto que separa os setores na impressão -->
          <div
            class="hidden print:flex flex-col items-center justify-center h-screen w-full break-after-page text-center">
            <img src="/img/logo.png" alt="Logo" class="h-24 object-contain mb-6">
            <h1 class="text-[22px] font-bold uppercase text-gray-800 mb-1">
              FOLHA DE PONTO
            </h1>
            <h1 class="text-[22px] font-bold uppercase text-gray-800 mb-1">{{ setor.nomeSetor }}</h1>
            <h2 class="text-xl font-semibold text-gray-700 mb-1">MÊS/ANO: {{ nomeMesCorrente() }}
              /{{ anoSelecionado() }}</h2>
            <h3 class="text-lg text-gray-600 font-medium">
              TOTAL DE SERVIDORES NO SETOR: {{ setor.totalServidores }}
            </h3>
          </div>

          @for (servidor of setor.servidores; track servidor.nome; let isLastServidor = $last) {

            <div
              class="w-full p-6 md:p-10 bg-white text-black font-sans text-xs md:text-sm
                     shadow-sm rounded-xl border border-gray-200 mb-10
                     print:w-full print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none break-inside-avoid"
              [class.break-after-page]="!(isLastSetor && isLastServidor)">

              <div class="flex justify-center mb-4 print:mb-2">
                <img src="/img/logo.png" alt="Logo" class="h-20 print:h-16 object-contain">
              </div>

              <div
                class="mb-4 font-bold uppercase tracking-wide leading-tight
                       bg-gray-50 border border-gray-300 p-3 rounded-lg print:mb-2 print:p-2 print:border-black print:rounded-none">

                <div class="flex items-center justify-between border-b-2 border-black pb-1 mb-1.5 print:pb-0.5 print:mb-1">
                  <span class="text-lg print:text-[15px]">NOME: {{ servidor.nome }}</span>
                  <span class="text-base print:text-[13px]">
                    MÊS: {{ nomeMesCorrente() }}/{{ anoSelecionado() }}
                  </span>
                </div>

                <div class="flex flex-col gap-1 print:gap-0 mt-1.5 print:text-[10.5px]">
                  <div>VÍNCULO: {{ servidor.vinculo }}</div>
                  <div>FORMA DE TRABALHO: {{ servidor.tipoAtividade || '-' }}</div>
                  <div>LOTAÇÃO: {{ setor.nomeSetor }}</div>
                </div>
              </div>

              <table
                class="w-full border-collapse border-2 border-black text-center table-fixed bg-white
                       print:text-[10px]">
                <thead>
                <tr class="bg-gray-200 print:bg-gray-200 print:h-[27px]">
                  <th class="border border-black py-0.5 px-1 print:p-0 w-[8%]">
                    DIA
                  </th>
                  <th class="border border-black py-0.5 px-1 print:p-0 w-[28%]">
                    HORÁRIO DE ENTRADA
                  </th>
                  <th class="border border-black py-0.5 px-1 print:p-0 w-[28%]">
                    HORÁRIO DE SAÍDA
                  </th>
                  <th class="border border-black py-0.5 px-1 print:p-0 w-[36%]">
                    ASSINATURAS
                  </th>
                </tr>
                </thead>
                <tbody>
                  @for (dia of diasDaFolha(); track dia.dia) {

                    <tr class="h-[32px] print:h-[27px]">

                      <td class="border border-black px-1 print:px-0 font-bold">{{ dia.dia | number:'2.0' }}</td>

                      @if (dia.tipo === 'NORMAL') {
                        <td class="border border-black px-1 print:px-0"></td>
                        <td class="border border-black px-1 print:px-0"></td>
                        <td class="border border-black px-1 print:px-0"></td>
                      } @else if (dia.tipo === 'FERIADO') {
                        <td
                          class="border border-black px-1 print:px-0 font-bold bg-gray-100 text-gray-700 print:text-black"
                          colspan="3">
                          {{ dia.nomeFeriado | uppercase }}
                        </td>
                      } @else {
                        <td
                          class="border border-black px-1 print:px-0 font-bold bg-gray-100 text-gray-700 print:text-black">
                          {{ dia.tipo }}
                        </td>
                        <td
                          class="border border-black px-1 print:px-0 font-bold bg-gray-100 text-gray-700 print:text-black">
                          {{ dia.tipo }}
                        </td>
                        <td
                          class="border border-black px-1 print:px-0 text-center bg-gray-100 text-gray-700 print:text-black">
                          -
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>

            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    @media print {
      .no-print {
        display: none !important;
      }
    }
  `]
})
export default class FolhaPontoRelatorioComponent {
  private readonly relatorioService = inject(RelatorioService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  // Inputs automáticos via withComponentInputBinding
  mes = input<string | number>();
  ano = input<string | number>();

  // Transforma o queryParams em signal com snapshot como initialValue
  private queryParams = toSignal(this.route.queryParams, {
    initialValue: this.route.snapshot.queryParams
  });

  // Extrai o Mês do input ou queryParams
  mesSelecionado = computed(() => {
    const fromInput = this.mes();
    if (fromInput !== undefined && fromInput !== null && fromInput !== '') {
      return Number(fromInput);
    }
    const mesParam = this.queryParams()?.['mes'] ?? this.route.snapshot.queryParams['mes'];
    return mesParam ? Number(mesParam) : new Date().getMonth() + 1;
  });

  // Extrai o Ano do input ou queryParams
  anoSelecionado = computed(() => {
    const fromInput = this.ano();
    if (fromInput !== undefined && fromInput !== null && fromInput !== '') {
      return Number(fromInput);
    }
    const anoParam = this.queryParams()?.['ano'] ?? this.route.snapshot.queryParams['ano'];
    return anoParam ? Number(anoParam) : new Date().getFullYear();
  });

  // Busca na classe CalendarUtils os dias do mês
  diasDaFolha = computed(() =>
    CalendarUtils.gerarDiasDoMes(this.anoSelecionado(), this.mesSelecionado())
  );

  // Busca o nome do mês através da seleção feita no dropbox
  nomeMesCorrente = computed(() => {
    const mesObj = MESES_DO_ANO.find(
      m => m.id === this.mesSelecionado());
    return mesObj ? mesObj.nome.toUpperCase() : '';
  });

  folhaPontoResource = rxResource({
    stream: () => {
      return this.relatorioService.gerarFolhaMes();
    }
  });

  setores = computed(() => {
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
