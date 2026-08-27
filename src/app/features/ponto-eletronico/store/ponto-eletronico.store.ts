import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { PontoEletronicoService } from '../services/ponto-eletronico.service';
import { Job, JobFile, JobHistoryItem, JobStatus } from '../models/ponto-eletronico.model';

interface PontoEletronicoState {
  job: Job | null;
  isGenerating: boolean;
  generatedFiles: JobFile[];
  history: JobHistoryItem[];
  loadingHistory: boolean;
}

const initialState: PontoEletronicoState = {
  job: null,
  isGenerating: false,
  generatedFiles: [],
  history: [],
  loadingHistory: false,
};

export const PontoEletronicoStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    percent: computed(() => store.job()?.progress?.percent ?? 0),
    statusLabel: computed(() => {
      const map: Record<JobStatus, string> = {
        QUEUED: 'Na fila',
        RUNNING: 'Processando',
        DONE: 'Conclu\u00eddo',
        FAILED: 'Falhou',
        CANCELLED: 'Cancelado',
      };
      return map[store.job()?.status ?? 'QUEUED'] ?? '';
    }),
    message: computed(() => store.job()?.progress?.message ?? ''),
    logs: computed(() => store.job()?.logs?.slice(-3) ?? []),
    canCancel: computed(() => {
      const s = store.job()?.status;
      return s === 'QUEUED' || s === 'RUNNING';
    }),
    hasXlsx: computed(() => store.generatedFiles().some((f) => f.format === 'xlsx')),
    hasPdf: computed(() => store.generatedFiles().some((f) => f.format === 'pdf')),
  })),
  withMethods((store, service = inject(PontoEletronicoService)) => ({
    setJob(job: Job | null) {
      patchState(store, { job });
    },

    setIsGenerating(value: boolean) {
      patchState(store, { isGenerating: value });
    },

    setGeneratedFiles(files: JobFile[]) {
      patchState(store, { generatedFiles: files });
    },

    clearJob() {
      patchState(store, { job: null, isGenerating: false, generatedFiles: [] });
    },

    async loadHistory() {
      patchState(store, { loadingHistory: true });
      try {
        const res = await firstValueFrom(service.getHistory(20));
        if (res?.ok) {
          patchState(store, { history: res.jobs });
        }
      } catch {
        // silencioso
      } finally {
        patchState(store, { loadingHistory: false });
      }
    },

    async deleteJob(jobId: string) {
      try {
        await firstValueFrom(service.deleteJob(jobId));
        await this.loadHistory();
      } catch {
        // erro tratado externamente
      }
    },

    async clearHistory() {
      try {
        await firstValueFrom(service.deleteHistory());
        await this.loadHistory();
      } catch {
        // erro tratado externamente
      }
    },
  }))
);
