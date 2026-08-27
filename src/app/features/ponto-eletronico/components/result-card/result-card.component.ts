import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';

@Component({
  selector: 'app-result-card',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Arquivos gerados</h2>

      <div class="space-y-0">
        @for (file of store.generatedFiles(); track file.name; let last = $last) {
          <div
            class="flex justify-between items-center gap-3 py-2.5"
            [class.border-b]="!last"
            [class.border-b-dashed]="!last"
            [class.border-gray-200]="!last">
            <span class="text-sm text-gray-800 break-all leading-snug">
              {{ file.name }}
              <span class="inline-block text-xs px-2 py-0.5 rounded bg-gray-100 text-cyan-600 ml-1.5 uppercase font-medium">
                {{ file.format }}
              </span>
            </span>
            <a
              [href]="fileUrl(file.name)"
              mat-stroked-button
              class="!shrink-0 !text-cyan-600 !border-gray-300 !text-xs !font-semibold
                     hover:!bg-cyan-50 hover:!border-cyan-500 !transition-all">
              <mat-icon class="!text-base !mr-1">download</mat-icon>
              Baixar
            </a>
          </div>
        }
      </div>

      <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
        @if (store.hasXlsx()) {
          <a
            [href]="downloadUrl('xlsx')"
            mat-stroked-button
            class="!text-cyan-600 !border-gray-300 !text-xs !font-semibold
                   hover:!bg-cyan-50 hover:!border-cyan-500 !transition-all">
            <mat-icon class="!text-base !mr-1">download</mat-icon>
            XLSX
          </a>
        }
        @if (store.hasPdf()) {
          <a
            [href]="downloadUrl('pdf')"
            mat-stroked-button
            class="!text-cyan-600 !border-gray-300 !text-xs !font-semibold
                   hover:!bg-cyan-50 hover:!border-cyan-500 !transition-all">
            <mat-icon class="!text-base !mr-1">download</mat-icon>
            PDF
          </a>
        }
        <a
          [href]="downloadUrl('zip')"
          mat-flat-button
          class="!bg-blue-600 !text-white !text-xs !font-bold
                 hover:!bg-blue-700 !transition-all">
          <mat-icon class="!text-base !mr-1">download</mat-icon>
          Baixar tudo (ZIP)
        </a>
      </div>
    </div>
  `,
})
export class ResultCardComponent {
  readonly store = inject(PontoEletronicoStore);
  private readonly service = inject(PontoEletronicoService);

  fileUrl(fileName: string): string {
    const job = this.store.job();
    return job ? this.service.getFileUrl(job.id, fileName) : '#';
  }

  downloadUrl(format: string): string {
    const job = this.store.job();
    return job ? this.service.getDownloadUrl(job.id, format) : '#';
  }
}
