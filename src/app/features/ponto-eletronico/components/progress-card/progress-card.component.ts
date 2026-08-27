import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';

@Component({
  selector: 'app-progress-card',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Processamento</h2>

      <div class="flex justify-between text-sm text-gray-700 mb-2">
        <span>{{ statusText() }}</span>
        <span class="font-semibold">{{ store.percent() }}%</span>
      </div>

      <div class="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-300">
        <div
          class="h-full rounded-full transition-all duration-[400ms] ease-linear"
          [style.width.%]="store.percent()"
          style="background: linear-gradient(90deg, #0891b2, #2563eb)">
        </div>
      </div>

      <p class="text-sm text-gray-600 mt-3 min-h-[20px]">
        {{ store.message() || 'Aguardando in\u00edcio...' }}
      </p>

      @if (store.logs().length > 0) {
        <p class="text-xs text-gray-400 mt-1 truncate" [title]="store.logs().join(' \u2022 ')">
          {{ store.logs().join(' \u2022 ') }}
        </p>
      }

      @if (store.canCancel()) {
        <div class="mt-4 pt-4 border-t border-gray-100">
          <button
            mat-stroked-button
            color="warn"
            (click)="onCancel()"
            class="!border-red-300 !text-red-600 hover:!bg-red-50 !transition-all !text-sm !font-bold">
            <mat-icon class="!text-base mr-1">cancel</mat-icon>
            Cancelar processamento
          </button>
        </div>
      }
    </div>
  `,
})
export class ProgressCardComponent {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);

  statusText = computed(() => {
    const job = this.store.job();
    if (!job) return '';
    const label = this.store.statusLabel();
    const p = job.progress;
    if (p?.months_total && job.status !== 'DONE') {
      return `${label} (${p.months_ok ?? 0}/${p.months_total} meses)`;
    }
    return label;
  });

  async onCancel(): Promise<void> {
    const job = this.store.job();
    if (!job) return;
    try {
      await firstValueFrom(this.service.cancelJob(job.id));
    } catch {
      // erro tratado externamente
    }
  }
}
