import { ChangeDetectionStrategy, Component, computed, effect, inject, viewChild } from '@angular/core';
import { RelatorioService } from '../../services/relatorio.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { MESES_DO_ANO } from '../../models/aniversariente.model';
import { of } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ArteAniversariantesComponent } from '../arte-aniversariantes/arte-aniversariantes.component';
import { ActivatedRoute } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-aniversariantes',
  imports: [MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatTooltipModule, ArteAniversariantesComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-screen-xl  mx-auto w-full flex flex-col h-full min-h-0 bg-gray-50">
      <div
        class="flex flex-col md:flex-row bg-white p-2 md:p-3 rounded-xl border border-gray-100
              items-center justify-between shadow-sm gap-4 md:gap-4 mb-2 shrink-0 h-auto">

        <div class="w-full md:w-1/3 md:pl-4 flex justify-start">
          <button
            mat-icon-button
            (click)="goBack()"
            matTooltip="Voltar"
            class="print:!hidden !bg-blue-600 border border-gray-300 drop-shadow-sm
                  transition-transform duration-500 hover:scale-105 shrink-0"
          >
            <mat-icon class="!text-white">arrow_back</mat-icon>
          </button>
        </div>

        <div class="w-full gap-2 flex items-center justify-center">
          <span class="text-xs md:text-base font-semibold tracking-[0.25em] text-[#0A1D3C] uppercase text-center">
            Listagem de
          </span>
          <h1 class="text-2xl md:text-[2rem] font-black text-[#0A1D3C] leading-tight mt-1 mb-1 text-center">
            ANIVERSARIANTES</h1>

          <div class="flex items-center justify-center gap-1 md:gap-2 text-[#C29B57] font-bold text-lg md:text-xl">
            <span class="text-2xl md:text-3xl leading-none">&bull;</span>
            <span class="uppercase tracking-wide text-center">{{ titleReport() }}</span>
            <span class="text-2xl md:text-3xl leading-none">&bull;</span>
          </div>
        </div>

        <div class="w-full md:w-1/3 flex md:pr-4 md:justify-end">
          <button
            mat-flat-button
            class="!bg-blue-700 w-full md:w-auto gap-2 !transition-transform duration-300 hover:!scale-105 disabled:!bg-gray-300"
            (click)="generateArt()"
            [disabled]="isLoading() || aniversariantes().length === 0">
            <mat-icon>image</mat-icon>
            Gerar Arte (PNG)
          </button>
        </div>
      </div>

      <div
        class="bg-white border border-gray-200 rounded-xl shadow-sm h-[calc(100dvh-200px)]
              md:h-[calc(100dvh-225px)] flex flex-col overflow-hidden">

        @if (isLoading()) {
          <div class="flex flex-1 justify-center items-center p-10">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (aniversariantes().length === 0) {
          <div class="flex flex-col flex-1 justify-center items-center p-10 text-gray-400 gap-3 text-center">
            <mat-icon class="text-5xl !text-gray-300">event_busy</mat-icon>
            <p class="text-base md:text-lg font-medium">
              Nenhum aniversariante em {{ titleReport() }}.
            </p>
          </div>
        } @else {

          <div class="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">

            <div class="rounded-xl overflow-hidden shadow-sm border border-[#0A1D3C]">
              <table class="w-full text-[15px] text-[#0A1D3C] border-collapse relative">

                <thead class="bg-[#0A1D3C] text-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th
                    class="py-3 px-2 md:px-4 font-semibold border-r border-white/20 w-24 md:w-36 text-sm md:text-base">
                    <div class="flex items-center justify-center gap-1 md:gap-2">
                      <svg class="w-4 h-4 md:w-5 md:h-5 hidden md:block" fill="none" viewBox="0 0 24 24"
                           stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                      DATA
                    </div>
                  </th>
                  <th class="py-3 px-2 md:px-4 font-semibold border-r border-white/20 text-left text-sm md:text-base">
                    <div class="flex justify-start md:justify-center items-center gap-1 md:gap-2">
                      <svg class="w-4 h-4 md:w-5 md:h-5 hidden md:block" fill="none" viewBox="0 0 24 24"
                           stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      NOME
                    </div>
                  </th>
                  <th class="py-3 px-2 md:px-4 font-semibold text-left text-sm md:text-base">
                    <div class="flex justify-start md:justify-center items-center gap-1 md:gap-2">
                      <svg class="w-4 h-4 md:w-5 md:h-5 hidden md:block" fill="none" viewBox="0 0 24 24"
                           stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.118v0H5.622c-1.085-.082-1.872-1.024-1.872-2.118v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                      </svg>
                      SETOR
                    </div>
                  </th>
                </tr>
                </thead>

                <tbody class="bg-white">
                  @for (item of aniversariantes(); track item.nome) {
                    <tr class="border-b border-[#E8DFC8] last:border-0 hover:bg-[#FDF8ED] transition-colors">
                      <td class="py-2 px-1 md:px-0 border-r border-[#E8DFC8]">
                        <div
                          class="flex items-center gap-1 md:gap-2 font-bold bg-[#FDF8ED] px-2 md:px-3 py-1 md:py-1.5 rounded-md w-fit mx-auto border border-[#E8DFC8]/60 text-xs md:text-sm">
                          <svg class="w-3 h-3 md:w-4 md:h-4 text-[#C29B57]" fill="none" viewBox="0 0 24 24"
                               stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                          </svg>
                          {{ item.diaMes }}
                        </div>
                      </td>
                      <td
                        class="py-2 px-2 md:px-3 border-r border-[#E8DFC8] font-semibold text-left text-xs md:text-[14px]">
                        {{ item.nome }}
                      </td>
                      <td class="py-2 px-2 md:px-3 text-left text-xs md:text-[14px]">
                        {{ item.setor }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-gray-50 px-5 py-4 border-t border-gray-200 text-right shrink-0">
        <span class="text-sm font-semibold text-gray-700">
          Total: {{ aniversariantes().length }} {{ aniversariantes().length === 1 ? 'aniversariante' : 'aniversariantes' }}
          no mês
        </span>
          </div>
        }
      </div>
    </div>
    <app-arte-aniversariantes [aniversariantes]="aniversariantes()" [titleReport]="titleReport()" />
  `
})
export default class AniversariantesComponent {
  private readonly relatorioService = inject(RelatorioService);
  private notificationService = inject(NotificationService); // Seu serviço de Toast
  private errorHandlerService = inject(ErrorHandlerService);
  private location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  // Transforma o Observable queryParams em signal
  private queryParams = toSignal(this.route.queryParams);

  artAniversariantes = viewChild.required(ArteAniversariantesComponent);

  // Pega o mês passado pela URL através de queryParams
  currentMonth = computed(() => {
    const monthUrl = this.queryParams()?.['month'];
    return monthUrl ? Number(monthUrl) : null;
  });


  titleReport = computed(() => {
    const idMonth = Number(this.currentMonth());
    const currentYear = new Date().getFullYear();
    const monthObj = MESES_DO_ANO.find(m => m.id === idMonth);
    const nameMonth = monthObj ? monthObj.nome : 'Mês inválido';
    return `${nameMonth}/${currentYear}`;
  });

  // Busca a lista de aniversariantes
  aniversariantesResource = rxResource({
    params: () => ({ month: this.currentMonth() }),
    stream: ({ params }) => {
      if (!params.month || isNaN(params.month)) {
        return of([]);
      }
      return this.relatorioService.getAniversariantesMes(params.month);
    }
  });

  // Usa a lista de aniversariantes
  aniversariantes = computed(() => {
    return this.aniversariantesResource.value() ?? [];
  });

  isLoading = this.aniversariantesResource.isLoading;

  constructor() {
    effect(() => {
      const erro = this.aniversariantesResource.error();
      if (erro) {
        this.errorHandlerService.handle(erro, 'Aniversariantes');
        this.goBack(); // Volta de tela se der erro
      }
    });
  }

  generateArt() {
    this.artAniversariantes().generateArt();
  }

  // Método para o botão Voltar
  goBack() {
    this.location.back();
  }


  copyClipboard() {
    const LisBirthday = this.aniversariantes();

    if (LisBirthday.length === 0) return;

    // Formata cada linha: "05/05 - José Antônio - Contabilidade"
    // O '\n' garante a quebra de linha entre os servidores
    const formatedText = LisBirthday
      .map(item => `${item.diaMes} - ${item.nome} - ${item.setor}`)
      .join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      // API nativa do navegador para copiar para o Clipboard
      navigator.clipboard.writeText(formatedText)
        .then(() => {
          this.notificationService.success(
            'Lista copiada!', 'Copiar');
        })
        .catch((err) => {
          this.errorHandlerService.handle(err, 'Erro Cópia');
        });
    } else {
      this.fallbackCopyClipboard(formatedText);
    }
  }

  //  Método auxiliar privado para garantir a cópia em ambientes sem HTTPS
  private fallbackCopyClipboard(texto: string) {
    // Cria um <textarea> fantasma no HTML
    const textArea = document.createElement('textarea');
    textArea.value = texto;

    // Esconde o elemento no canto superior da tela para não causar rolagem nem piscar
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';

    // Injeta no DOM
    document.body.appendChild(textArea);

    // Foca e seleciona o conteúdo inteiro do textarea
    textArea.focus();
    textArea.select();

    try {
      // Executa o comando de cópia legado do navegador
      const sucesso = document.execCommand('copy');
      if (sucesso) {
        this.notificationService.success('Lista copiada!', 'Copiar');
      } else {
        this.errorHandlerService.handle(new Error('Navegador bloqueou a ação'), 'Erro Cópia');
      }
    } catch (err: any) {
      this.errorHandlerService.handle(err, 'Erro Cópia');
    } finally {
      // Limpeza rigorosa: remove o textarea fantasma do DOM
      document.body.removeChild(textArea);
    }
  }
}
