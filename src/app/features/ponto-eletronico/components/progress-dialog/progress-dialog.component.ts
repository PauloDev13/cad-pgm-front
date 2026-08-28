import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';

@Component({
  selector: 'app-progress-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title class="!text-xl !font-medium !text-gray-800 !pb-2">Processamento</h2>
    <mat-dialog-content class="!pt-2">
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
        {{ store.message() || 'Aguardando início...' }}
      </p>

      @if (store.logs().length > 0) {
        <p class="text-xs text-gray-400 mt-1 truncate" [title]="store.logs().join(' • ')">
          {{ store.logs().join(' • ') }}
        </p>
      }
    </mat-dialog-content>

    @if (store.canCancel()) {
      <mat-dialog-actions class="!px-6 !pb-4 !pt-2">
        <button
          mat-stroked-button
          color="warn"
          (click)="onCancel()"
          class="!border-red-300 !text-red-600 hover:!bg-red-50 !transition-all !text-sm !font-bold">
          <mat-icon class="!text-base mr-1">cancel</mat-icon>
          Cancelar processamento
        </button>
      </mat-dialog-actions>
    }
  `,
})
export class ProgressDialogComponent {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);
  readonly dialogRef = inject(MatDialogRef<ProgressDialogComponent>);

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
