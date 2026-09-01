import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData } from '../../../../shared/model/confirm-dialog-data.model';
import { JobStatus } from '../../models/ponto-eletronico.model';

@Component({
  selector: 'app-history-card',
  standalone: true,
  imports: [DatePipe, NgClass, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .history-scroll::-webkit-scrollbar {
      width: 6px;
    }

    .history-scroll::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 3px;
    }

    .history-scroll::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    .history-scroll::-webkit-scrollbar-thumb:hover {
      background: #2563eb;
    }
  `],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6 flex flex-col h-full min-h-0">
      <!-- Header -->
      <div class="flex justify-between items-center gap-3 mb-4 shrink-0">
        <h2 class="text-xl font-medium text-gray-800 m-0">Hist\u00f3rico de gera\u00e7\u00f5es</h2>
        <button
          mat-stroked-button
          (click)="onClearHistory()"
          class="!border-gray-300 !text-gray-600 !text-xs !font-semibold
                 hover:!bg-gray-100 !transition-all">
          <mat-icon class="!text-base !mr-1">delete_sweep</mat-icon>
          Limpar
        </button>
      </div>

      <!-- Lista scroll\u00e1vel -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden min-h-0 history-scroll">
        @if (store.history().length === 0) {
          <div class="flex flex-col items-center justify-center py-10 text-gray-400">
            <mat-icon class="text-4xl !text-gray-300 mb-2">schedule</mat-icon>
            <p class="text-sm">Nenhuma gera\u00e7\u00e3o realizada nesta sess\u00e3o.</p>
          </div>
        }

        @for (item of store.history(); track item.id; let last = $last) {
          <div
            class="flex justify-between gap-3 py-3"
            [class.border-b]="!last"
            [class.border-b-dashed]="!last"
            [class.border-gray-200]="!last">

            <div class="flex-1 min-w-0">
              <!-- Meta -->
              <div class="flex items-center gap-2 flex-wrap text-sm">
                <span
                  class="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full leading-snug"
                  [ngClass]="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
                <span class="text-gray-500">{{ item.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                <span class="text-gray-700">Unid. {{ item.payload.unit }}</span>
                <span class="text-gray-500">{{ item.payload.date_start }} a {{ item.payload.date_end }}</span>
              </div>

              <!-- Erro -->
              @if (item.status === 'FAILED' && item.error) {
                <p class="text-sm text-red-500 mt-1.5 flex items-start gap-1">
                  <mat-icon class="text-base !w-4 !h-4 mt-0.5 shrink-0">error_outline</mat-icon>
                  {{ item.error }}
                </p>
              }

              <!-- Arquivos -->
               @if (item.status === 'DONE' && item.files.length > 0) {
                  <div class="flex flex-wrap gap-x-3 gap-y-1 mt-2 overflow-hidden">
                    @for (file of item.files; track file.name) {
                      <button
                        (click)="onDownloadFile(item.id, file.name)"
                        class="text-xs text-cyan-600 hover:text-cyan-800 hover:underline inline-flex items-center gap-1 break-all text-left max-w-full">
                        <mat-icon class="text-sm !w-3.5 !h-3.5 shrink-0">description</mat-icon>
                        <span class="break-all">{{ file.name }}</span>
                      </button>
                    }
                    <button
                      (click)="onDownloadZip(item.id)"
                      class="text-xs text-cyan-600 font-bold hover:text-cyan-800 hover:underline inline-flex items-center gap-1 shrink-0">
                      <mat-icon class="text-sm !w-3.5 !h-3.5">archive</mat-icon>
                      Todos (ZIP)
                    </button>
                  </div>
                }
            </div>

            <!-- Bot\u00e3o excluir -->
            @if (item.status === 'DONE' || item.status === 'FAILED' || item.status === 'CANCELLED') {
              <button
                mat-icon-button
                (click)="onDelete(item.id)"
                class="!text-red-500 hover:!bg-red-50 !transition-all self-start"
                title="Excluir esta gera\u00e7\u00e3o">
                <mat-icon class="!text-base">delete</mat-icon>
              </button>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class HistoryCardComponent implements OnInit {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  ngOnInit(): void {
    this.store.loadHistory();
  }

  statusLabel(status: JobStatus): string {
    const map: Record<JobStatus, string> = {
      QUEUED: 'Na fila',
      RUNNING: 'Processando',
      DONE: 'Conclu\u00eddo',
      FAILED: 'Falhou',
      CANCELLED: 'Cancelado'
    };
    return map[status] ?? status;
  }

  statusClass(status: JobStatus): string {
    const classes: Record<JobStatus, string> = {
      QUEUED: 'bg-gray-200 text-gray-600',
      RUNNING: 'bg-blue-100 text-blue-700',
      DONE: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-amber-100 text-amber-700'
    };
    return classes[status] ?? '';
  }

  onDownloadFile(jobId: string, fileName: string): void {
    this.service.downloadFileBlob(jobId, fileName).subscribe({
      next: (blob) => this.triggerDownload(blob, fileName),
      error: () => this.notification.error('Erro ao baixar o arquivo.'),
    });
  }

  onDownloadZip(jobId: string): void {
    this.service.downloadJobBlob(jobId, 'zip').subscribe({
      next: (blob) => {
        const item = this.store.history().find((j) => j.id === jobId);
        const base = item?.files[0]?.name.replace(/\.[^.]+$/, '') || `ponto_${jobId}`;
        this.triggerDownload(blob, `${base}.zip`);
      },
      error: () => this.notification.error('Erro ao baixar o arquivo.'),
    });
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async onDelete(jobId: string): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: {
        title: 'Excluir gera\u00e7\u00e3o',
        message: 'Excluir esta gera\u00e7\u00e3o e remover os arquivos gerados do disco?'
      } as ConfirmDialogData
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) return;

    try {
      await this.store.deleteJob(jobId);
      this.notification.success('Gera\u00e7\u00e3o exclu\u00edda com sucesso.');
    } catch {
      this.notification.error('Erro ao excluir a gera\u00e7\u00e3o.');
    }
  }

  async onClearHistory(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data: {
        title: 'Limpar hist\u00f3rico',
        message: 'Remover todas as gera\u00e7\u00f5es conclu\u00eddas e as que falharam do hist\u00f3rico e do disco?'
      } as ConfirmDialogData
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) return;

    try {
      await this.store.clearHistory();
      this.notification.success('Hist\u00f3rico limpo com sucesso.');
    } catch {
      this.notification.error('Erro ao limpar o hist\u00f3rico.');
    }
  }
}
