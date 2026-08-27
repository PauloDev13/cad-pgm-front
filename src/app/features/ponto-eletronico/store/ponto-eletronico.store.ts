import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { PontoEletronicoService } from '../services/ponto-eletronico.service';
import {
  GeneratePayload,
  Job,
  JobFile,
  JobHistoryItem,
  JobStatus,
  Unidade,
} from '../models/ponto-eletronico.model';

interface PontoEletronicoState {
  job: Job | null;
  isGenerating: boolean;
  generatedFiles: JobFile[];
  history: JobHistoryItem[];
  unidades: Unidade[];
  loadingHistory: boolean;
}

const initialState: PontoEletronicoState = {
  job: null,
  isGenerating: false,
  generatedFiles: [],
  history: [],
  unidades: [],
  loadingHistory: false,
};

export const PontoEletronicoStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    percent: computed(() => store.job()?.progress?.percent ?? 0),
    statusLabel: computed(() => {
      const statusMap: Record<JobStatus, string> = {
        QUEUED: 'Na fila',
        RUNNING: 'Processando',
        DONE: 'Concluído',
        FAILED: 'Falhou',
        CANCELLED: 'Cancelado',
      };
      return statusMap[store.job()?.status ?? 'QUEUED'] ?? '';
    }),
    message: computed(() => store.job()?.progress?.message ?? ''),
    logs: computed(() => (store.job()?.logs as string[] | undefined)?.slice(-3) ?? []),
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
        const res = await service.getHistory(20).toPromise();
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
        await service.deleteJob(jobId).toPromise();
        await this.loadHistory();
      } catch {
        // erro tratado externamente
      }
    },

    async clearHistory() {
      try {
        await service.deleteHistory().toPromise();
        await this.loadHistory();
      } catch {
        // erro tratado externamente
      }
    },

    async searchUnidades(query: string) {
      try {
        const res = await service.searchUnidades(query).toPromise();
        if (res?.ok) {
          patchState(store, { unidades: res.results });
        }
      } catch {
        patchState(store, { unidades: [] });
      }
    },

    clearUnidades() {
      patchState(store, { unidades: [] });
    },
  }))
);
