import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RelatorioService } from '../../services/relatorio.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { AniversarianteModel } from '../../models/aniversariente.model';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-aniversariantes',
  imports: [MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatTooltipModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 max-w-5xl mx-auto w-full flex flex-col h-full min-h-0 bg-gray-50">

      <div
        class="flex flex-col md:flex-row bg-white p-3 md:p-5 rounded-xl border border-gray-100
          items-center justify-between shadow-sm gap-4 mb-3 shrink-0 h-auto">

        <div class="flex items-center justify-between w-full md:w-auto gap-2 md:gap-4">
          <button
            mat-icon-button
            (click)="goBack()"
            matTooltip="Voltar"
            class="print:!hidden !bg-blue-600 border border-gray-300 drop-shadow-sm
               transition-transform duration-500 hover:scale-105 shrink-0"
          >
            <mat-icon class="!text-white">arrow_back</mat-icon>
          </button>

          <div class="flex-1 md:flex-none flex items-center justify-center gap-2">
            <h1 class="text-lg md:text-2xl font-extrabold text-gray-900 leading-tight">
              Aniversariantes de <span class="capitalize text-gray-800">{{ currentMonth() }}</span>/{{ currentYear() }}
            </h1>
            <span class="text-xl md:text-2xl print:hidden">🎉</span>
          </div>
        </div>

        <button
          mat-flat-button
          class="!bg-blue-700 w-full md:w-auto gap-2 !transition-transform duration-300 hover:!scale-105 disabled:!bg-gray-300"
          (click)="copyClipboard()"
          [disabled]="isLoading() || aniversariantes().length === 0">
          <mat-icon>content_copy</mat-icon>
          Copiar Lista (TXT)
        </button>
      </div>

      <div
        class="bg-white border border-gray-200 rounded-xl shadow-sm h-[calc(100dvh-200px)] md:h-[calc(100dvh-220px)]
          flex flex-col overflow-hidden">

        @if (isLoading()) {
          <div class="flex flex-1 justify-center items-center p-10">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (aniversariantes().length === 0) {
          <div class="flex flex-col flex-1 justify-center items-center p-10 text-gray-400 gap-3 text-center">
            <mat-icon class="text-5xl !text-gray-300">event_busy</mat-icon>
            <p class="text-base md:text-lg font-medium">
              Nenhum aniversariante em {{ currentMonth() }}/{{ currentYear() }}.
            </p>
          </div>
        } @else {

          <div class="flex-1 overflow-auto custom-scrollbar p-2 md:p-3">
            <ul class="flex flex-col gap-1">

              @for (item of aniversariantes(); track $index) {
                <li
                  class="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-blue-50/50 transition-colors
                    rounded-lg border border-transparent hover:border-blue-100">

                  <div
                    class="bg-blue-100 border border-blue-200 text-blue-800 font-bold px-2 py-2
                       rounded-md shrink-0 shadow-sm text-center w-[55px] md:w-[65px] text-xs md:text-sm">
                    {{ item.diaMes }}
                  </div>

                  <div class="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3 flex-1 min-w-0">
                <span class="font-semibold text-gray-800 text-sm md:text-base truncate w-full md:w-auto">
                  {{ item.nome }}
                </span>

                    <span class="text-xs md:text-sm text-gray-500 flex items-center gap-1 truncate w-full md:w-auto">
                  <mat-icon class="scale-75 !text-blue-400 w-4 h-4 !m-0 !p-0">work</mat-icon>
                      {{ item.setor }}
                </span>
                  </div>

                </li>
              }

            </ul>
          </div>

          <div class="bg-gray-50 px-5 py-3 border-t border-gray-100 text-right shrink-0">
        <span class="text-xs md:text-sm font-semibold text-gray-600">
          Total: {{ aniversariantes().length }} {{ aniversariantes().length === 1 ? 'aniversariante' : 'aniversariantes' }}
          no mês
        </span>
          </div>
        }
      </div>
    </div>
  `
})
export default class AniversariantesComponent implements OnInit {
  private readonly relatorioService = inject(RelatorioService);
  private notificationService = inject(NotificationService); // Seu serviço de Toast
  private errorHandlerService = inject(ErrorHandlerService);
  private location = inject(Location);

  aniversariantes = signal<AniversarianteModel[]>([]);
  isLoading = signal(true);

  // Nome do mês atual dinâmico (ex: "maio")
  currentMonth = computed(() => {
    const currentDate = new Date();
    return currentDate.toLocaleString('pt-BR', { month: 'long' });
  });

  // Signal para o ano atual (ex: 2026)
  currentYear = signal(new Date().getFullYear());

  ngOnInit(): void {
    this.loadList();
  }

  loadList() {
    this.isLoading.set(true);
    this.relatorioService.getAniversariantesMes()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.aniversariantes.set(data),
        error: (err) => this.errorHandlerService.handle(err, 'Buscar Aniversariantes')
      });
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
    const textoFormatado = LisBirthday
      .map(item => `${item.diaMes} - ${item.nome} - ${item.setor}`)
      .join('\n');

    // API nativa do navegador para copiar para o Clipboard
    navigator.clipboard.writeText(textoFormatado)
      .then(() => {
        this.notificationService.success(
          'Lista copiada!', 'Copiar');
      })
      .catch((err) => {
        this.errorHandlerService.handle(err, 'Erro Cópia');
        // this.notificationService.error(
        //   'Não foi possível copiar. Verifique as permissões do navegador.');
      });
  }
}
