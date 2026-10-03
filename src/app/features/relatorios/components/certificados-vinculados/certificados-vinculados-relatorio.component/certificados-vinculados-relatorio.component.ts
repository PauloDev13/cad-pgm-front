import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../shared/components/loading.component/loading.component';
import { RelatorioService } from '../../../services/relatorio.service';
import { ErrorHandlerService } from '../../../../../shared/service/error-handler.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-certificados-vinculados-relatorio',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    LoadingComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="md:p-3 relative flex flex-col w-full h-[calc(100dvh-130px)] min-h-0 overflow-hidden bg-gray-50/50
            print:h-auto print:bg-white print:block"
      style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">
      <!-- Loading Overlay -->
      <div
        class="absolute inset-0 z-50 bg-white/60 flex justify-center items-center backdrop-blur-sm transition-opacity duration-300"
        [class.opacity-0]="!isLoading()"
        [class.opacity-100]="isLoading()"
        [class.pointer-events-none]="!isLoading()">
        <app-loading [isLoading]="true" />
      </div>
      <!-- Barra Superior de Ações (Oculta na impressão) -->
      <div class="shadow-sm rounded-xl border border-gray-100 p-2 md:p-3 md:flex-row bg-white shrink-0 mb-2 print:hidden flex
                md:gap-4 flex-col gap-4 w-full max-w-4xl mx-auto">
        <div class="flex justify-between items-center w-full">
          <button
            class="bg-gray-500 text-white px-4 md:px-6 py-2 rounded-lg font-bold shadow-md hover:bg-gray-600 hover:shadow-lg transition-all flex items-center gap-2"
            (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            <span class="hidden sm:inline">Voltar</span>
          </button>

          <h2 class="text-center text-lg md:text-xl font-bold text-gray-700 uppercase tracking-wide m-0">
            Certificado Digital Vinculado Por Servidor
          </h2>

          <button
            class="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2"
            (click)="printReport()"
            [disabled]="isLoading() || vinculos().length === 0">
            <mat-icon>print</mat-icon>
            <span class="hidden sm:inline">Imprimir/Salvar</span>
          </button>
        </div>
      </div>
      <!-- Conteúdo do Relatório / Agrupamento -->
      <div
        class="flex-1 min-h-0 overflow-y-auto w-full max-w-4xl mx-auto px-2 md:px-0 pb-8 print:p-0 print:overflow-visible print:max-w-none">

        <!-- Estado Vazio -->
        @if (!isLoading() && vinculos().length === 0) {
          <div class="flex flex-col flex-1 justify-center items-center p-10 text-gray-400 gap-3 text-center">
            <mat-icon class="text-5xl !text-gray-300">verified_user</mat-icon>
            <p class="text-base md:text-lg font-medium">
              Nenhum vínculo de certificado digital encontrado para os parâmetros selecionados.
            </p>
          </div>
        }
        <!-- Cabeçalho de Impressão Oficial -->
        <div class="hidden print:flex items-center justify-between border-b-2 border-black pb-3 mb-6">
          <img src="/img/logo.png" alt="Logo" class="h-16 object-contain">
          <div class="text-right">
            <h1 class="text-base font-bold uppercase text-black m-0">
              Certificado Digital Vinculado Por Servidor
            </h1>
            <span class="text-xs text-gray-600">Procuradoria Geral do Município</span>
          </div>
        </div>
        <!-- Lista de Procuradores e Servidores -->
        @for (procurador of vinculos(); track procurador.nomeProcurador) {
          <div
            class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6
                   print:shadow-none print:border-none print:mb-4">

            <!-- Título do Procurador -->
            <div class="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4 print:border-black">
              <mat-icon class="text-blue-800 print:text-black">gavel</mat-icon>
              <h3 class="text-base md:text-lg font-bold text-blue-900 print:text-black m-0">
                {{ procurador.nomeProcurador }}
              </h3>
              <span class="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 print:hidden">
                {{ procurador.servidores.length }} {{ procurador.servidores.length === 1 ? 'vinculado' : 'vinculados' }}
              </span>
            </div>
            <!-- Tabela / Sublista de Servidores -->
            @if (procurador.servidores.length > 0) {
              <table class="w-full border-collapse text-left text-xs md:text-sm">
                <thead>
                <tr
                  class="bg-gray-100 text-gray-700 uppercase print:bg-gray-200 print:text-black font-semibold border-b border-gray-300 print:border-black">
                  <th class="py-2 px-3 w-7/12">Nome do Servidor</th>
                  <th class="py-2 px-3 w-5/12">Setor</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 print:divide-black">
                  @for (servidor of procurador.servidores; track servidor.nomeServidor) {
                    <tr class="hover:bg-gray-50/80 transition-colors print:hover:bg-transparent">
                      <td class="py-2 px-3 font-medium text-gray-900 print:text-black">
                        {{ servidor.nomeServidor }}
                      </td>
                      <td class="py-2 px-3 text-gray-600 print:text-black">
                        {{ servidor.nomeSetor }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <p class="text-xs text-gray-500 italic py-2">Nenhum servidor vinculado a este procurador.</p>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class CertificadosVinculadosRelatorioComponent {
  private readonly relatorioService = inject(RelatorioService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly location = inject(Location);

  // Input automático via withComponentInputBinding
  procuradores = input<string | string[]>();

  // Normalização reativa do array de procuradores a partir do input da rota
  procuradoresSelecionados = computed<string[]>(() => {
    const raw = this.procuradores();
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  });

  // Requisição reativa orientada a Signal (executa automaticamente a cada alteração nos params)
  certificadosResource = rxResource({
    params: () => ({
      procuradores: this.procuradoresSelecionados()
    }),
    stream: ({ params }) => {
      return this.relatorioService.getCertificadosVinculados(params.procuradores);
    }
  });

  vinculos = computed(() => this.certificadosResource.value() ?? []);
  isLoading = this.certificadosResource.isLoading;

  constructor() {
    effect(() => {
      const error = this.certificadosResource.error();
      if (error) {
        this.errorHandlerService.handle(error, 'Certificados Vinculados');
      }
    });
  }

  printReport(): void {
    window.print();
  }

  goBack(): void {
    this.location.back();
  }
}
