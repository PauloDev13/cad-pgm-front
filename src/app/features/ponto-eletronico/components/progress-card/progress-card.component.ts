import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';

@Component({
  selector: 'app-progress-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Processamento</h2>

      <div class="flex justify-between text-sm text-gray-700 mb-1">
        <span>{{ store.statusLabel() }}</span>
        <span>{{ store.percent() }}%</span>
      </div>

      <div class="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-300">
        <div
          class="h-full rounded-full transition-all duration-400 ease-linear"
          [style.width.%]="store.percent()"
          style="background: linear-gradient(90deg, #0891b2, #2563eb)">
        </div>
      </div>

      <p class="text-sm text-gray-600 mt-2">{{ store.message() }}</p>

      @if (store.logs().length > 0) {
        <p class="text-xs text-gray-400 mt-1">{{ store.logs().join(' \u2022 ') }}</p>
      }

      @if (store.canCancel()) {
        <div class="mt-4">
          <button
            (click)="onCancel()"
            class="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow
                   hover:bg-red-700 transition-all">
            Cancelar
          </button>
        </div>
      }
    </div>
  `,
})
export class ProgressCardComponent {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);

  async onCancel(): Promise<void> {
    const job = this.store.job();
    if (!job) return;

    try {
      await this.service.cancelJob(job.id).toPromise();
    } catch {
      // erro tratado externamente
    }
  }
}
