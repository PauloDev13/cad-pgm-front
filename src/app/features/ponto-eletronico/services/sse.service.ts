import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Job, SSEMessage } from '../models/ponto-eletronico.model';
import { PontoEletronicoService } from './ponto-eletronico.service';
import { AuthStore } from '../../../core/auth/store/auth.store';

@Injectable({ providedIn: 'root' })
export class SSEService {
  private readonly http = inject(HttpClient);
  private readonly pontoService = inject(PontoEletronicoService);
  private readonly authStore = inject(AuthStore);
  private readonly opts = { withCredentials: true } as const;

  private activeController: AbortController | null = null;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Acompanha o progresso de um job via SSE com fallback para polling.
   * Emite SSEMessage com type 'update' ou 'error'.
   * Completa automaticamente quando o job atinge estado terminal.
   */
  trackJob(jobId: string): Observable<SSEMessage> {
    this.stop();

    return new Observable<SSEMessage>((subscriber) => {
      const url = this.pontoService.getJobEventsUrl(jobId);

      const controller = new AbortController();
      this.activeController = controller;

      fetchEventSource(url, {
        method: 'GET',
        headers: {
          ...(this.authStore.token()
            ? { 'Authorization': `Bearer ${this.authStore.token()}` }
            : {}),
          'Accept': 'text/event-stream',
        },
        credentials: 'include',
        signal: controller.signal,
        onmessage: (evt) => {
          try {
            const msg: SSEMessage = JSON.parse(evt.data);
            subscriber.next(msg);

            if (msg.job && ['DONE', 'FAILED', 'CANCELLED'].includes(msg.job.status)) {
              subscriber.complete();
              this.stop();
            }
          } catch {
            // mensagem inválida, ignora
          }
        },
        onerror: () => {
          // SSE falhou — fallback para polling
          this.startPolling(jobId, subscriber);
        },
        onclose: () => {
          // Conexão fechada pelo servidor sem estado terminal
          if (!subscriber.closed) {
            this.startPolling(jobId, subscriber);
          }
        },
      });

      return () => this.stop();
    });
  }

  /** Cancela tracking ativo (SSE + polling). */
  stop(): void {
    this.activeController?.abort();
    this.activeController = null;
    this.stopPolling();
  }

  // ── Polling fallback ────────────────────────────────────────────────────

  private startPolling(jobId: string, subscriber: { next: (msg: SSEMessage) => void; complete: () => void; closed: boolean }): void {
    this.stopPolling();

    this.pollingTimer = setInterval(async () => {
      if (subscriber.closed) {
        this.stopPolling();
        return;
      }

      try {
        const res = await this.http.get<{ ok: boolean; job: Job }>(
          `/python-api/api/v1/jobs/${jobId}`, this.opts
        ).toPromise();

        if (!res?.ok) return;

        subscriber.next({ type: 'update', job: res.job });

        if (['DONE', 'FAILED', 'CANCELLED'].includes(res.job.status)) {
          subscriber.complete();
          this.stopPolling();
        }
      } catch {
        // mantém o polling
      }
    }, 2000);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }
}
