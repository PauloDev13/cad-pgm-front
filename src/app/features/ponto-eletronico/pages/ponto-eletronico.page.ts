import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { PontoEletronicoStore } from '../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../services/ponto-eletronico.service';
import { ConsultaFormComponent } from '../components/consulta-form/consulta-form.component';
import { ProgressCardComponent } from '../components/progress-card/progress-card.component';
import { ResultCardComponent } from '../components/result-card/result-card.component';
import { HistoryCardComponent } from '../components/history-card/history-card.component';
import { GeneratePayload, Job } from '../models/ponto-eletronico.model';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';

@Component({
  selector: 'app-ponto-eletronico-page',
  standalone: true,
  imports: [
    ConsultaFormComponent,
    ProgressCardComponent,
    ResultCardComponent,
    HistoryCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-6">
      <!-- Coluna principal -->
      <div class="flex-1 flex flex-col gap-6 min-w-0">
        <app-consulta-form />

        @if (store.job()) {
          <app-progress-card />
        }

        @if (store.generatedFiles().length > 0) {
          <app-result-card />
        }
      </div>

      <!-- Coluna lateral (hist\u00f3rico) -->
      <div class="w-full lg:w-[420px] shrink-0">
        <app-history-card />
      </div>
    </div>
  `
})
export class PontoEletronicoPage implements AfterViewInit, OnDestroy {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);
  private readonly notification = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  private activeEventSource: EventSource | null = null;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

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
    this.stopTracking();
    this.destroy$.next();
    this.destroy$.complete();
    this.store.clearJob();
  }

  private async onSubmit(payload: GeneratePayload): Promise<void> {
    if (this.store.job()) return;

    this.store.setIsGenerating(true);

    try {
      const validation = await firstValueFrom(this.service.validate(payload));
      if (!validation?.valid) {
        this.store.setIsGenerating(false);
        this.notification.warning('Corrija os campos destacados.');
        return;
      }

      const response = await firstValueFrom(this.service.createJob(payload));
      if (!response?.ok) {
        this.store.setIsGenerating(false);
        this.notification.error(response?.message ?? 'Erro ao criar a gera\u00e7\u00e3o.');
        return;
      }

      this.startJobTracking(response.job);
    } catch {
      this.store.setIsGenerating(false);
      this.notification.error('Erro ao conectar com a API.');
    }
  }

  private startJobTracking(job: Job): void {
    this.store.setJob(job);
    this.stopTracking();

    const es = new EventSource(this.service.getJobEventsUrl(job.id));
    this.activeEventSource = es;

    es.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type !== 'update') return;

        const j: Job = msg.job;
        if (j.status === 'DONE') this.onJobDone(j);
        else if (j.status === 'FAILED') this.onJobFailed(j);
        else if (j.status === 'CANCELLED') this.onJobCancelled();
        else this.store.setJob(j);
      } catch {
        // mensagem inv\u00e1lida, ignora
      }
    };

    es.onerror = () => {
      es.close();
      this.activeEventSource = null;
      this.startPolling(job.id);
    };
  }

  private startPolling(jobId: string): void {
    this.stopPolling();
    this.pollingTimer = setInterval(async () => {
      try {
        const res = await firstValueFrom(this.service.getJob(jobId));
        if (!res?.ok) return;

        const j = res.job;
        if (j.status === 'DONE') this.onJobDone(j);
        else if (j.status === 'FAILED') this.onJobFailed(j);
        else if (j.status === 'CANCELLED') this.onJobCancelled();
        else this.store.setJob(j);
      } catch {
        // mant\u00e9m o polling
      }
    }, 2000);
  }

  private onJobDone(job: Job): void {
    this.stopTracking();
    this.store.setJob(job);
    this.store.setGeneratedFiles(job.files ?? []);
    this.store.setIsGenerating(false);
    this.store.loadHistory();
    this.notification.success('Arquivos gerados com sucesso. Escolha os arquivos para baixar.');
  }

  private onJobFailed(job: Job): void {
    this.stopTracking();
    this.store.setJob(job);
    this.store.setIsGenerating(false);
    this.store.loadHistory();
    this.notification.error(job.error ?? 'Falha ao gerar os arquivos. Consulte o hist\u00f3rico.');
  }

  private onJobCancelled(): void {
    this.stopTracking();
    this.store.clearJob();
    this.store.setIsGenerating(false);
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
    this.stopTracking();
    this.store.clearJob();
  }

  private stopTracking(): void {
    this.activeEventSource?.close();
    this.activeEventSource = null;
    this.stopPolling();
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
}
