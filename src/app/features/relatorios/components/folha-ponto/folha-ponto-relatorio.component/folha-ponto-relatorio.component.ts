import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RelatorioService } from '../../../services/relatorio.service';
import { FolhaPontoDTO } from '../../../models/folha-ponto.model';
import { CalendarUtils } from '../../../utils/calendar-utils';
import { MESES_DO_ANO } from '../../../models/aniversariente.model';
import { ErrorHandlerService } from '../../../../../shared/service/error-handler.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-folha-ponto-relatorio.component',
  imports: [CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-4 no-print px-8 pt-4">
      <button class="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-blue-700"
              (click)="printReport()">
        Imprimir Folhas
      </button>
    </div>

    @for (servidor of servidores(); track $index) {
      <div class="folha-ponto-container p-8 bg-white text-black font-sans text-sm md:text-base">

        <div class="mb-6 font-semibold uppercase tracking-wide leading-relaxed">
          <div class="flex justify-between border-b border-black pb-1 mb-2">
            <span>NOME: {{ servidor.nome }}</span>
            <span>MÊS: {{ nomeMesCorrente() }}/{{ anoSelecionado() }}</span>
          </div>

          <div>
            VÍNCULO: {{ servidor.vinculo }}
          </div>

          <div>
            FORMA DE TRABALHO: {{ servidor.formaTrabalho }}
          </div>

          <div class="mt-1">
            SETOR: {{ servidor.setor }}
          </div>
        </div>

        <table class="w-full border-collapse border border-black text-center text-sm">
          <thead>
          <tr class="bg-gray-200">
            <th class="border border-black p-2 w-16">DIA</th>
            <th class="border border-black p-2">HORÁRIO DE ENTRADA</th>
            <th class="border border-black p-2">HORÁRIO DE SAÍDA</th>
            <th class="border border-black p-2 w-1/3">ASSINATURAS</th>
          </tr>
          </thead>
          <tbody>
            @for (dia of diasDaFolha(); track dia.dia) {
              <tr>
                <td class="border border-black p-2">{{ dia.dia | number:'2.0' }}</td>

                @if (dia.tipo === 'NORMAL') {
                  <td class="border border-black p-2"></td>
                  <td class="border border-black p-2"></td>
                  <td class="border border-black p-2"></td>
                } @else if (dia.tipo === 'FERIADO') {
                  <td class="border border-black p-2 font-bold bg-gray-100" colspan="2">
                    {{ dia.nomeFeriado | uppercase }}
                  </td>
                  <td class="border border-black p-2 text-center bg-gray-100">-</td>
                } @else {
                  <td class="border border-black p-2 font-bold bg-gray-100">{{ dia.tipo }}</td>
                  <td class="border border-black p-2 font-bold bg-gray-100">{{ dia.tipo }}</td>
                  <td class="border border-black p-2 text-center bg-gray-100">-</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
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
export default class FolhaPontoRelatorioComponent implements OnInit {
  private relatorioService = inject(RelatorioService);
  private errorHandlerService = inject(ErrorHandlerService);
  private readonly route = inject(ActivatedRoute);

  servidores = signal<FolhaPontoDTO[]>([]);
  mesSelecionado = signal<number>(1);
  anoSelecionado = signal<number>(2026);

  diasDaFolha = computed(() =>
    CalendarUtils.gerarDiasDoMes(this.anoSelecionado(), this.mesSelecionado())
  );

  nomeMesCorrente = computed(() => {
    const mesObj = MESES_DO_ANO.find(
      m => m.id === this.mesSelecionado());
    return mesObj ? mesObj.nome.toUpperCase() : '';
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Captura da URL
      const mes = params['mes'];
      const ano = params['ano'];
      const setorId = params['setorId']; // Agora é esperado que sempre venha preenchido

      if (mes && ano && setorId) {
        // 1. Alimenta o Frontend com o Mês e Ano para a exibição visual e cálculo de dias
        this.mesSelecionado.set(Number(mes));
        this.anoSelecionado.set(Number(ano));

        // 2. Chama a API passando APENAS a regra de negócio exigida por eles (O Setor)
        this.relatorioService.gerarFolhaMes(Number(setorId))
          .subscribe({
            next: (dados) => this.servidores.set(dados),
            error: (err) => this.errorHandlerService.handle(err, 'Folha de Ponto')
          });
      }
    });
  }

  printReport() {
    window.print();
  }
}
