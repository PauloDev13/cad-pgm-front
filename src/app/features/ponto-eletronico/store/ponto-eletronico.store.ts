import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { PontoEletronicoService } from '../services/ponto-eletronico.service';
import { PontoAuthService } from '../services/ponto-auth.service';
import { GeneratePayload, Job, JobFile, JobStatus } from '../models/ponto-eletronico.model';

interface PontoEletronicoState {
  // Auth
  isAuthenticated: boolean;
  currentUser: string | null;

  // Job ativo
  job: Job | null;
  isGenerating: boolean;
  generatedFiles: JobFile[];

  // Histórico
  history: Job[];
  loadingHistory: boolean;
}

const initialState: PontoEletronicoState = {
  isAuthenticated: false,
  currentUser: null,
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
    buttonLabel: computed(() => {
      const excel = store.generatedFiles().some((f) => f.format === 'xlsx');
      const pdf = store.generatedFiles().some((f) => f.format === 'pdf');
      if (excel && pdf) return 'GERAR PLANILHAS E ARQUIVO PDF';
      if (excel) return 'GERAR PLANILHAS';
      if (pdf) return 'GERAR ARQUIVO PDF';
      return 'GERAR ARQUIVO';
    }),
  })),
  withMethods((
    store,
    pontoService = inject(PontoEletronicoService),
    authService = inject(PontoAuthService),
  ) => ({
    // ── Auth ──────────────────────────────────────────────────────────────

    async login(username: string, password: string) {
      const res = await firstValueFrom(authService.login({ username, password }));
      if (res.ok) {
        patchState(store, {
          isAuthenticated: true,
          currentUser: res.user ?? username,
        });
      }
      return res;
    },

    async logout() {
      try {
        await firstValueFrom(authService.logout());
      } finally {
        patchState(store, {
          isAuthenticated: false,
          currentUser: null,
          job: null,
          isGenerating: false,
          generatedFiles: [],
        });
      }
    },

    async checkSession() {
      const res = await firstValueFrom(authService.checkSession());
      patchState(store, {
        isAuthenticated: res.ok,
        currentUser: res.ok ? (res.user ?? null) : null,
      });
      return res;
    },

    // ── Jobs ──────────────────────────────────────────────────────────────

    async submitJob(payload: GeneratePayload) {
      patchState(store, { isGenerating: true });
      try {
        const validation = await firstValueFrom(pontoService.validate(payload));
        if (!validation.valid) {
          patchState(store, { isGenerating: false });
          return { ok: false as const, errors: validation.errors };
        }

        const response = await firstValueFrom(pontoService.createJob(payload));
        if (response.ok) {
          patchState(store, { job: response.job });
          return { ok: true as const, job: response.job };
        }

        patchState(store, { isGenerating: false });
        return { ok: false as const, errors: response.errors };
      } catch {
        patchState(store, { isGenerating: false });
        return { ok: false as const, errors: { generic: 'Erro de conex\u00e3o.' } };
      }
    },

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

    // ── Histórico ─────────────────────────────────────────────────────────

    async loadHistory() {
      patchState(store, { loadingHistory: true });
      try {
        const res = await firstValueFrom(pontoService.getHistory(20));
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
        await firstValueFrom(pontoService.deleteJob(jobId));
        await this.loadHistory();
      } catch {
        // erro tratado externamente
      }
    },

    async clearHistory() {
      try {
        await firstValueFrom(pontoService.deleteHistory());
        await this.loadHistory();
      } catch {
        // erro tratado externamente
      }
    },
  }))
);
