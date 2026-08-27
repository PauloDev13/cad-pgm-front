import { ChangeDetectionStrategy, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PontoEletronicoStore } from '../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../services/ponto-eletronico.service';
import { ConsultaFormComponent } from '../components/consulta-form/consulta-form.component';
import { ProgressCardComponent } from '../components/progress-card/progress-card.component';
import { ResultCardComponent } from '../components/result-card/result-card.component';
import { HistoryCardComponent } from '../components/history-card/history-card.component';
import { GeneratePayload, Job } from '../models/ponto-eletronico.model';

@Component({
  selector: 'app-ponto-eletronico-page',
  standalone: true,
  imports: [
    ConsultaFormComponent,
    ProgressCardComponent,
    ResultCardComponent,
    HistoryCardComponent,
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

      <!-- Coluna lateral (histórico) -->
      <div class="w-full lg:w-96 shrink-0">
        <app-history-card />
      </div>
    </div>
  `,
})
export class PontoEletronicoPage implements OnDestroy {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(ConsultaFormComponent) consultaForm!: ConsultaFormComponent;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.clearJob();
  }

  ngAfterViewInit(): void {
    this.consultaForm.submitPayload
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload) => this.onSubmit(payload));

    this.consultaForm.clearEvent
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onClear());
  }

  private async onSubmit(payload: GeneratePayload): Promise<void> {
    if (this.store.job()) return;

    this.store.setIsGenerating(true);

    try {
      const validation = await this.service.validate(payload).toPromise();
      if (!validation?.valid) {
        this.store.setIsGenerating(false);
        return;
      }

      const response = await this.service.createJob(payload).toPromise();
      if (!response?.ok) {
        this.store.setIsGenerating(false);
        return;
      }

      this.startJobTracking(response.job);
    } catch {
      this.store.setIsGenerating(false);
    }
  }

  private startJobTracking(job: Job): void {
    this.store.setJob(job);

    const eventUrl = this.service.getJobEventsUrl(job.id);
    const es = new EventSource(eventUrl);

    es.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type !== 'update') return;

        const j: Job = msg.job;
        if (j.status === 'DONE') {
          this.onJobDone(j, es);
        } else if (j.status === 'FAILED') {
          this.onJobFailed(j, es);
        } else if (j.status === 'CANCELLED') {
          this.onJobCancelled(es);
        } else {
          this.store.setJob(j);
        }
      } catch {
        // mensagem inválida, ignora
      }
    };

    es.onerror = () => {
      es.close();
      this.startPolling(job.id);
    };
  }

  private startPolling(jobId: string): void {
    const timer = setInterval(async () => {
      try {
        const res = await this.service.getJob(jobId).toPromise();
        if (!res?.ok) return;

        const j = res.job;
        if (j.status === 'DONE') {
          this.onJobDone(j, null);
          clearInterval(timer);
        } else if (j.status === 'FAILED') {
          this.onJobFailed(j, null);
          clearInterval(timer);
        } else if (j.status === 'CANCELLED') {
          this.onJobCancelled(null);
          clearInterval(timer);
        } else {
          this.store.setJob(j);
        }
      } catch {
        // mantém polling
      }
    }, 2000);
  }

  private onJobDone(job: Job, es: EventSource | null): void {
    es?.close();
    this.store.setJob(job);
    this.store.setGeneratedFiles(job.files ?? []);
    this.store.setIsGenerating(false);
    this.store.loadHistory();
  }

  private onJobFailed(job: Job, es: EventSource | null): void {
    es?.close();
    this.store.setJob(job);
    this.store.setIsGenerating(false);
    this.store.loadHistory();
  }

  private onJobCancelled(es: EventSource | null): void {
    es?.close();
    this.store.clearJob();
    this.store.setIsGenerating(false);
    this.store.loadHistory();
  }

  private onClear(): void {
    const job = this.store.job();
    if (job && (job.status === 'QUEUED' || job.status === 'RUNNING')) {
      this.service.cancelJob(job.id).subscribe();
    }
    this.store.clearJob();
  }
}
