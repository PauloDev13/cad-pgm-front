import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SistemasVinculadosStore } from '../../../store/sistema.store';

@Component({
  selector: 'app-sistemas-vinculados-relatorio',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  providers: [SistemasVinculadosStore],
  standalone: true,
  template: `
    <div
      class="md:p-3 relative flex flex-col w-full h-[calc(100dvh-130px)] min-h-0 overflow-hidden bg-gray-50/50
             print:h-auto print:bg-white print:block"
      style="-webkit-print-color-adjust: exact; print-color-adjust: exact;">

      <div class="shadow-sm rounded-xl border border-gray-100 p-2 md:p-3 bg-white shrink-0 mb-2 print:hidden
                  flex w-full max-w-4xl mx-auto">
        <div class="flex justify-between items-center w-full">
          <button
            class="bg-gray-500 text-white px-4 md:px-6 py-2 !rounded-3xl font-bold shadow-md hover:bg-gray-600
                   hover:shadow-lg transition-all flex items-center gap-2"
            (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            <span class="hidden sm:inline">Voltar</span>
          </button>

          <h2 class="text-center text-lg md:text-xl font-bold text-gray-700 uppercase tracking-wide m-0">
            Sistema Vinculado Por Servidor
          </h2>

          <button
            class="bg-blue-600 text-white px-4 md:px-6 py-2 !rounded-3xl font-bold shadow-md hover:bg-blue-700
                   hover:shadow-lg transition-all flex items-center gap-2"
            (click)="printReport()"
            [disabled]="loading() || vinculos().length === 0">
            <mat-icon class="!mr-1">print</mat-icon>
            <span class="hidden sm:inline">Imprimir/Salvar</span>
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center p-10 text-gray-500">Carregando relatório...</div>
      } @else if (vinculos().length === 0) {
        <div class="flex flex-col flex-1 justify-center items-center p-10 text-gray-400 gap-3 text-center">
          <mat-icon class="text-5xl !text-gray-300">dns</mat-icon>
          <p class="text-base md:text-lg font-medium">
            Nenhum vínculo de sistema encontrado para os parâmetros selecionados.
          </p>
        </div>
      }

      <div class="hidden print:flex items-center justify-between border-b-2 border-black pb-3 mb-6">
        <img src="/img/logo.png" alt="Logo" class="h-16 object-contain">
        <div class="text-right">
          <h1 class="text-base font-bold uppercase text-black m-0">
            Sistema Vinculado Por Servidor
          </h1>
          <span class="text-xs text-gray-600">Procuradoria Geral do Município</span>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto w-full max-w-4xl mx-auto px-2 md:px-0 pb-8
                  print:p-0 print:overflow-visible print:max-w-none">
        @for (sistema of vinculos(); track sistema.nomeSistema) {
          <section class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6
                          print:shadow-none print:border-none print:mb-4">
            <div class="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4 print:border-black">
              <mat-icon class="text-blue-800 print:text-black">dns</mat-icon>
              <h3 class="text-base md:text-lg font-bold text-blue-900 print:text-black m-0">
                {{ sistema.nomeSistema }}
              </h3>
              <span class="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 print:hidden">
                {{ sistema.servidores.length }}
                {{ sistema.servidores.length === 1 ? 'servidor' : 'servidores' }}
              </span>
            </div>

            @if (sistema.servidores.length > 0) {
              <table class="w-full border-collapse text-left text-xs md:text-sm">
                <thead>
                <tr class="bg-gray-100 text-gray-700 uppercase print:bg-gray-200 print:text-black
                             font-semibold border-b border-gray-300 print:border-black">
                  <th class="py-2 px-3">Nome do Servidor</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 print:divide-black">
                  @for (servidor of sistema.servidores; track servidor) {
                    <tr class="hover:bg-gray-50/80 transition-colors print:hover:bg-transparent">
                      <td class="py-2 px-3 font-medium text-gray-900 print:text-black">{{ servidor }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <p class="text-xs text-gray-500 italic py-2">Nenhum servidor vinculado a este sistema.</p>
            }
          </section>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SistemasVinculadosRelatorioComponent {
  private readonly store = inject(SistemasVinculadosStore);
  private readonly location = inject(Location);

  // Requer withComponentInputBinding() habilitado no router.
  sistemas = input<string | string[]>();

  readonly sistemasSelecionados = computed(() => {
    const valor = this.sistemas();
    return valor ? (Array.isArray(valor) ? valor : [valor]) : [];
  });

  readonly vinculos = this.store.vinculos;
  readonly loading = this.store.loading;

  constructor() {
    effect(() => this.store.carregar(this.sistemasSelecionados()));
  }

  printReport(): void {
    window.print();
  }

  goBack(): void {
    this.location.back();
  }
}
