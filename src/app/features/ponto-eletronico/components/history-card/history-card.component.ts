import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';
import { JobStatus } from '../../models/ponto-eletronico.model';

@Component({
  selector: 'app-history-card',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6 flex flex-col max-h-[calc(100dvh-100px)]">
      <div class="flex justify-between items-center gap-3 mb-4 shrink-0">
        <h2 class="text-xl font-medium text-gray-800">Histórico de gerações</h2>
        <button
          (click)="onClearHistory()"
          class="bg-gray-100 text-gray-600 border border-gray-300 px-3 py-1 rounded text-sm font-semibold
                 hover:bg-gray-200 transition-all whitespace-nowrap">
          Limpar histórico
        </button>
      </div>

      <div class="flex-1 overflow-y-auto min-h-0">
        @if (store.history().length === 0) {
          <p class="text-sm text-gray-400">Nenhuma geração realizada nesta sessão.</p>
        }

        @for (item of store.history(); track item.id) {
          <div class="flex justify-between gap-3 py-3 border-b border-dashed border-gray-200 last:border-b-0">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap text-sm">
                <span
                  class="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full"
                  [ngClass]="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
                <span class="text-gray-600">{{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                <span class="text-gray-600">Unid. {{ item.payload?.unit ?? '?' }}</span>
                <span class="text-gray-600">{{ item.payload?.dateStart }} a {{ item.payload?.dateEnd }}</span>
              </div>

              @if (item.status === 'FAILED' && item.error) {
                <p class="text-sm text-red-500 mt-1">{{ item.error }}</p>
              }

              @if (item.status === 'DONE' && item.files.length > 0) {
                <div class="flex flex-wrap gap-2 mt-2">
                  @for (file of item.files; track file.name) {
                    <a
                      [href]="fileDownloadUrl(item.id, file.name)"
                      class="text-sm text-cyan-600 hover:underline">
                      {{ file.name }}
                    </a>
                  }
                  <a
                    [href]="jobDownloadUrl(item.id, 'zip')"
                    class="text-sm text-cyan-600 font-bold hover:underline">
                    Todos (ZIP)
                  </a>
                </div>
              }
            </div>

            @if (item.status === 'DONE' || item.status === 'FAILED' || item.status === 'CANCELLED') {
              <button
                (click)="onDelete(item.id)"
                class="shrink-0 bg-transparent text-red-500 border border-red-300 px-3 py-1 rounded text-xs font-semibold
                       hover:bg-red-50 transition-all self-start">
                Excluir
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class HistoryCardComponent implements OnInit {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);

  ngOnInit(): void {
    this.store.loadHistory();
  }

  statusLabel(status: JobStatus): string {
    const map: Record<JobStatus, string> = {
      QUEUED: 'Na fila',
      RUNNING: 'Processando',
      DONE: 'Concluído',
      FAILED: 'Falhou',
      CANCELLED: 'Cancelado',
    };
    return map[status] ?? status;
  }

  statusClass(status: JobStatus): string {
    const classes: Record<JobStatus, string> = {
      QUEUED: 'bg-gray-200 text-gray-600',
      RUNNING: 'bg-blue-100 text-blue-700',
      DONE: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-amber-100 text-amber-700',
    };
    return classes[status] ?? '';
  }

  fileDownloadUrl(jobId: string, fileName: string): string {
    return this.service.getFileUrl(jobId, fileName);
  }

  jobDownloadUrl(jobId: string, format: string): string {
    return this.service.getDownloadUrl(jobId, format);
  }

  async onDelete(jobId: string): Promise<void> {
    await this.store.deleteJob(jobId);
  }

  async onClearHistory(): Promise<void> {
    await this.store.clearHistory();
  }
}
