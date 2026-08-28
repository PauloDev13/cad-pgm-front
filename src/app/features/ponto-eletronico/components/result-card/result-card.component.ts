import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PontoEletronicoStore } from '../../store/ponto-eletronico.store';
import { PontoEletronicoService } from '../../services/ponto-eletronico.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';

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
             <button
               mat-stroked-button
               (click)="onDownloadFile(file.name)"
               class="!shrink-0 !text-cyan-600 !border-gray-300 !text-xs !font-semibold
                      hover:!bg-cyan-50 hover:!border-cyan-500 !transition-all">
               <mat-icon class="!text-base !mr-1">download</mat-icon>
               Baixar
             </button>
           </div>
         }
       </div>

       <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
         @if (store.hasXlsx()) {
           <button
             mat-stroked-button
             (click)="onDownload('xlsx')"
             class="!text-cyan-600 !border-gray-300 !text-xs !font-semibold
                    hover:!bg-cyan-50 hover:!border-cyan-500 !transition-all">
             <mat-icon class="!text-base !mr-1">download</mat-icon>
             XLSX
           </button>
         }
         @if (store.hasPdf()) {
           <button
             mat-stroked-button
             (click)="onDownload('pdf')"
             class="!text-cyan-600 !border-gray-300 !text-xs !font-semibold
                    hover:!bg-cyan-50 hover:!border-cyan-500 !transition-all">
             <mat-icon class="!text-base !mr-1">download</mat-icon>
             PDF
           </button>
         }
         <button
           mat-flat-button
           (click)="onDownload('zip')"
           class="!bg-blue-600 !text-white !text-xs !font-bold
                  hover:!bg-blue-700 !transition-all">
           <mat-icon class="!text-base !mr-1">download</mat-icon>
           Baixar tudo (ZIP)
         </button>
       </div>
     </div>
   `,
 })
 export class ResultCardComponent {
   readonly store = inject(PontoEletronicoStore);
   private readonly service = inject(PontoEletronicoService);
   private readonly notification = inject(NotificationService);

   onDownloadFile(fileName: string): void {
     const job = this.store.job();
     if (!job) return;
     this.service.downloadFileBlob(job.id, fileName).subscribe({
       next: (blob) => this.triggerDownload(blob, fileName),
       error: () => this.notification.error('Erro ao baixar o arquivo.'),
     });
   }

   onDownload(format: string): void {
     const job = this.store.job();
     if (!job) return;
     this.service.downloadJobBlob(job.id, format).subscribe({
       next: (blob) => {
         const ext = format === 'zip' ? 'zip' : format;
         const name = `ponto_${job.id}.${ext}`;
         // Tenta extrair filename do Content-Disposition
         this.triggerDownload(blob, name);
       },
       error: () => this.notification.error('Erro ao baixar o arquivo.'),
     });
   }

   private triggerDownload(blob: Blob, fileName: string): void {
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = fileName;
     a.click();
     URL.revokeObjectURL(url);
   }
}
