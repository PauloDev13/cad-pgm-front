import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { PontoEletronicoStore } from '../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../services/ponto-eletronico.service';
import { SSEService } from '../services/sse.service';
import { ConsultaFormComponent } from '../components/consulta-form/consulta-form.component';
import { ResultCardComponent } from '../components/result-card/result-card.component';
import { HistoryCardComponent } from '../components/history-card/history-card.component';
import { ProgressDialogComponent } from '../components/progress-dialog/progress-dialog.component';
import { GeneratePayload, Job } from '../models/ponto-eletronico.model';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';

@Component({
  selector: 'app-ponto-eletronico-page',
  standalone: true,
  imports: [
    ConsultaFormComponent,
    ResultCardComponent,
    HistoryCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col lg:flex-row gap-6 w-full max-w-[1520px] mx-auto p-6">
      <!-- Coluna principal -->
      <div class="flex-1 flex flex-col gap-6 min-w-0">
        <app-consulta-form />

        @if (store.generatedFiles().length > 0) {
          <app-result-card />
        }
      </div>

      <!-- Coluna lateral (hist\u00f3rico) -->
      <div class="w-full lg:w-[650px] shrink-0">
        <app-history-card />
      </div>
    </div>
  `
})
export class PontoEletronicoPage implements AfterViewInit, OnDestroy {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);
  private readonly sseService = inject(SSEService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private progressDialogRef: MatDialogRef<ProgressDialogComponent> | null = null;
  private readonly destroy$ = new Subject<void>();

  @ViewChild(ConsultaFormComponent) consultaForm!: ConsultaFormComponent;

  ngAfterViewInit(): void {
    this.consultaForm.submitPayload
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload) => this.onSubmit(payload));

    this.consultaForm.clearEvent
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onClear());
  }

  ngOnDestroy(): void {
    this.sseService.stop();
    this.destroy$.next();
    this.destroy$.complete();
    this.closeProgressDialog();
    this.store.clearJob();
  }

  private async onSubmit(payload: GeneratePayload): Promise<void> {
    if (this.store.isGenerating()) return;
    // Permite nova geração sem precisar limpar: job DONE/FAILED não bloqueia
    if (this.store.job() && this.store.job()?.status !== 'DONE' && this.store.job()?.status !== 'FAILED' && this.store.job()?.status !== 'CANCELLED') {
      return;
    }

    const result = await this.store.submitJob(payload);

    if (!result.ok) {
      if (result.errors?.['generic']) {
        this.notification.error(result.errors['generic']);
      } else {
        this.notification.warning('Corrija os campos destacados.');
      }
      return;
    }

    this.startJobTracking(result.job);
  }

  private startJobTracking(job: Job): void {
    this.openProgressDialog();
    this.sseService.trackJob(job.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (msg) => {
          if (msg.type === 'error') {
            this.notification.warning(msg.message || 'Erro no acompanhamento.');
            return;
          }
          if (!msg.job) return;

          const j = msg.job;
          if (j.status === 'DONE') this.onJobDone(j);
          else if (j.status === 'FAILED') this.onJobFailed(j);
          else if (j.status === 'CANCELLED') this.onJobCancelled();
          else this.store.setJob(j);
        },
      });
  }

  private onJobDone(job: Job): void {
    this.store.setJob(job);
    this.store.setGeneratedFiles(job.files ?? []);
    this.store.setIsGenerating(false);
    this.store.loadHistory();
    this.notification.success('Arquivos gerados com sucesso. Escolha os arquivos para baixar.');
    // Delay 500ms para usuário ver 100% antes de fechar modal; mantém job para download em "Arquivos Gerados"
    setTimeout(() => this.closeProgressDialog(), 500);
  }

  private onJobFailed(job: Job): void {
    this.store.setJob(job);
    this.store.setIsGenerating(false);
    this.closeProgressDialog();
    this.store.loadHistory();
    this.notification.error(job.error ?? 'Falha ao gerar os arquivos. Consulte o hist\u00f3rico.');
  }

  private onJobCancelled(): void {
    this.store.clearJob();
    this.store.setIsGenerating(false);
    this.closeProgressDialog();
    this.store.loadHistory();
    this.notification.info('Processamento cancelado.');
  }

  private onClear(): void {
    const job = this.store.job();
    if (job && (job.status === 'QUEUED' || job.status === 'RUNNING')) {
      this.service.cancelJob(job.id).subscribe({
        error: () => this.notification.error('Erro ao cancelar o processamento.')
      });
    }
    this.sseService.stop();
    this.closeProgressDialog();
    this.store.clearJob();
  }

  private openProgressDialog(): void {
    if (this.progressDialogRef) return;
    this.progressDialogRef = this.dialog.open(ProgressDialogComponent, {
      disableClose: true,
      width: '520px',
      maxWidth: '95vw',
      autoFocus: false,
    });
  }

  private closeProgressDialog(): void {
    this.progressDialogRef?.close();
    this.progressDialogRef = null;
  }
}
