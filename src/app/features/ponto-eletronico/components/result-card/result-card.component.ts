import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';

@Component({
  selector: 'app-result-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Arquivos gerados</h2>

      @for (file of store.generatedFiles(); track file.name) {
        <div class="flex justify-between items-center gap-3 py-2 border-b border-dashed border-gray-200 last:border-b-0">
          <span class="text-sm text-gray-800 break-all">
            {{ file.name }}
            <span class="inline-block text-xs px-2 py-0.5 rounded bg-gray-100 text-cyan-600 ml-1 uppercase font-medium">
              {{ file.format }}
            </span>
          </span>
          <a
            [href]="fileUrl(file.name)"
            class="shrink-0 bg-gray-100 text-cyan-600 border border-gray-300 px-3 py-1 rounded text-sm font-semibold
                   hover:bg-gray-200 hover:border-cyan-600 transition-all">
            Baixar
          </a>
        </div>
      }

      <div class="flex flex-wrap gap-2 mt-4">
        @if (store.hasXlsx()) {
          <a
            [href]="downloadUrl('xlsx')"
            class="bg-gray-100 text-cyan-600 border border-gray-300 px-3 py-1.5 rounded text-sm font-semibold
                   hover:bg-gray-200 transition-all">
            XLSX
          </a>
        }
        @if (store.hasPdf()) {
          <a
            [href]="downloadUrl('pdf')"
            class="bg-gray-100 text-cyan-600 border border-gray-300 px-3 py-1.5 rounded text-sm font-semibold
                   hover:bg-gray-200 transition-all">
            PDF
          </a>
        }
        <a
          [href]="downloadUrl('zip')"
          class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold shadow
                 hover:bg-blue-700 transition-all">
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
