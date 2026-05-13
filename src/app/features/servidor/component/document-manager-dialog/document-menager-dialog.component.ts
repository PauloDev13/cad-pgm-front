import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UploadService } from '../../services/upload.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { DocumentUploadModel } from '../../models/document-upload.model';
import { finalize } from 'rxjs';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomDeleteService } from '../../../../shared/service/custom-delete.service';

@Component({
  selector: 'app-document-manager-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full">
      <div class="flex justify-between items-center px-4 md:px-6 py-4 border-b border-gray-200 shrink-0">
        <h2 class="text-lg md:text-xl font-bold text-blue-700 m-0">Anexos</h2>
        <button
          mat-icon-button
          mat-dialog-close
          aria-label="Fechar"
          class="!w-8 !h-8 !flex !items-center !justify-center !bg-blue-800 hover:!bg-blue-500 !transition-colors !duration-300"
        >
          <mat-icon class="!text-white !scale-90 !leading-none !m-0 !p-0">close</mat-icon>
        </button>
      </div>

      <div class="p-4 md:p-6 flex-1 overflow-auto bg-gray-50">

        <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6 shrink-0 transition-all duration-300">
          <input
            type="file"
            #fileInput
            class="hidden"
            accept="application/pdf"
            (change)="onFileSelected($event)">

          @if (!selectedFile()) {
            <div
              class="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4
                    bg-blue-50 px-4 py-4 sm:py-2 rounded-md border border-blue-100 flex-1 w-full
                    text-center sm:text-left">
              <div>
                <h3 class="font-semibold text-blue-700 text-sm">Anexar Novo Arquivo</h3>
                <p class="text-xs text-gray-500 mt-1 sm:mt-0">Formato aceito: PDF (Máx. 1.5 MB)</p>
              </div>

              <button
                mat-flat-button
                class="w-full sm:w-auto !bg-blue-700 gap-2 !transition-transform duration-300
                      hover:!scale-105"
                (click)="fileInput.click()">
                <mat-icon>search</mat-icon>
                Selecionar PDF
              </button>
            </div>
          } @else {
            <div
              class="flex flex-col md:flex-row items-center justify-between gap-4 bg-blue-50 px-4
                    py-3 sm:py-2 rounded-md border border-blue-100 w-full">

              <div class="flex items-center gap-3 w-full md:w-auto overflow-hidden">
                <mat-icon class="!text-red-500 shrink-0">picture_as_pdf</mat-icon>
                <div class="flex flex-col overflow-hidden min-w-0">
              <span
                class="font-semibold text-gray-700 text-sm truncate"
                [matTooltip]="selectedFile()!.name"
              >
                {{ selectedFile()!.name }}
              </span>
                  <span class="text-xs text-gray-500">
                {{ (selectedFile()!.size / 1024 / 1024).toFixed(2) }} MB
              </span>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                @if (isUploading()) {
                  <div
                    class="flex items-center justify-center text-blue-600 text-sm font-medium
                          gap-2 w-full py-2">
                    <mat-spinner diameter="20"></mat-spinner>
                    Enviando...
                  </div>
                } @else {
                  <button
                    mat-stroked-button
                    type="button"
                    class="w-full sm:w-auto !border-blue-600 !text-blue-600 !transition-transform
                           duration-300 hover:!scale-105 disabled:!border-gray-300 disabled:!text-gray-400 "
                    (click)="clearSelection()">
                    Cancelar
                  </button>
                  <button
                    mat-flat-button
                    class="w-full sm:w-auto !bg-green-600 gap-2 !transition-transform duration-300
                          hover:!scale-105"
                    (click)="sendPdfFile()">
                    <mat-icon>cloud_upload</mat-icon>
                    Enviar Arquivo
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          @if (isLoadingList()) {
            <div class="flex justify-center p-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (documents().length === 0) {
            <div class="p-8 text-center text-red-500">
              <mat-icon class="text-4xl !text-red-500 mb-2">description</mat-icon>
              <p>Nenhum documento anexado a este servidor.</p>
            </div>
          } @else {
            <div class="flex-1 overflow-auto w-full">
              <table mat-table [dataSource]="documents()" class="w-full">

                <ng-container matColumnDef="originalName">
                  <th mat-header-cell *matHeaderCellDef class="font-semibold px-4">Arquivo</th>
                  <td mat-cell *matCellDef="let doc"
                      class="font-medium text-gray-700 px-4 max-w-[150px] sm:max-w-xs md:max-w-none
                            truncate"
                      [matTooltip]="doc.originalName">
                    <div class="flex items-center gap-2 truncate">
                      <mat-icon class="!text-red-500 shrink-0">picture_as_pdf</mat-icon>
                      <span class="truncate">{{ doc.originalName }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="dataUpload">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="hidden sm:table-cell font-semibold text-center px-4">
                    Data Envio
                  </th>
                  <td mat-cell *matCellDef="let doc"
                      class="hidden sm:table-cell text-gray-500 text-center px-4 whitespace-nowrap">
                    {{ doc.dataUpload }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="formatedSize">
                  <th mat-header-cell *matHeaderCellDef class="hidden md:table-cell font-semibold text-center px-4">
                    Tamanho
                  </th>
                  <td mat-cell *matCellDef="let doc"
                      class="hidden md:table-cell text-gray-500 text-center px-4 whitespace-nowrap">
                    {{ doc.formatedSize }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="acoes">
                  <th
                    mat-header-cell
                    *matHeaderCellDef
                    class="text-right px-4 w-[1%]">
                    Ações
                  </th>
                  <td mat-cell *matCellDef="let doc" class="px-4 w-[1%]">
                    <div class="flex items-center justify-end gap-1 min-w-max">
                      <button
                        mat-icon-button
                        matTooltip="Visualizar"
                        (click)="documentView(doc.id)">
                        <mat-icon class="!text-green-700">visibility</mat-icon>
                      </button>
                      <button
                        mat-icon-button
                        matTooltip="Excluir"
                        (click)="deleteDocument(doc)">
                        <mat-icon class="!text-red-500">delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr
                  mat-header-row
                  *matHeaderRowDef="displayedColumns; sticky: true"
                  class="bg-gray-50 border-b border-gray-200 !h-10">
                </tr>
                <tr
                  mat-row *matRowDef="let row; columns:displayedColumns"
                  class="!h-10 odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50
                    transition-colors cursor-pointer border-gray-100">
                </tr>
              </table>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class DocumentManagerDialogComponent implements OnInit {
  // Recebe o ID do servidor através do DATA do MatDialog
  data = inject(MAT_DIALOG_DATA);
  private uploadService = inject(UploadService);
  private customDeleteService = inject(CustomDeleteService);
  private notificationService = inject(NotificationService);
  private errorHandlerService = inject(ErrorHandlerService);

  // Para limpar o input nativo caso o usuário cancele
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  documents = signal<DocumentUploadModel[]>([]);
  isUploading = signal(false);
  isLoadingList = signal(false);

  // Signal para guardar o arquivo na "Área de Preparação"
  selectedFile = signal<File | null>(null);

  displayedColumns = ['originalName', 'dataUpload', 'formatedSize', 'acoes'];

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.isLoadingList.set(true);

    this.uploadService.listDocuments(this.data.servidorId)
      .pipe(finalize(() => this.isLoadingList.set(false)))
      .subscribe(docs => this.documents.set(docs));
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const maxSize = 1.5 * 1024 * 1024; // 1.5 MB

    if (!file) return;

    // Validação do Tipo
    if (file.type !== 'application/pdf') {
      this.notificationService.error(
        'Apenas arquivos PDF são permitidos.',
        'Arquivo não permitido'
      );
      this.clearSelection();
      return;
    }

    // 2. Validação de Tamanho (Máx: 1.5MB)
    if (file.size > maxSize) {
      this.notificationService.error(
        `O arquivo excede o <strong>(limite de 1.5 MB)</strong>.`,
        'Tamanho Excedente'
      );
      this.clearSelection();
      return;
    }

    // Limitamos a 50 caracteres (já contando com a extensão .pdf)
    if (file.name.length > 50) {
      this.notificationService.error(
        `O nome do arquivo é muito extenso. O nome deve ter no <strong>(máximo 50
                 caracteres)</strong>.`,
        'Nome longo', { duration: 5000 }
      );
      this.clearSelection();
      return;
    }

    // Bloqueia: Barras (/ \), aspas (" '), pipes (|), asteriscos (*), e símbolos especiais (& % $ @ !).
    const regexValidCharacters = /^[a-zA-Z0-9 \-_\.\(\)\[\]À-ÿ]+$/;

    if (!regexValidCharacters.test(file.name)) {
      this.notificationService.error(
        `O nome do arquivo contém símbolos não permitidos
                <strong>(como aspas, barras ou %$@)</strong>. Renomei o arquivo`,
        'Nome inválido'
      );
      this.clearSelection();
      return;
    }

    this.selectedFile.set(file);
  }

  sendPdfFile() {
    const file = this.selectedFile();

    if (!file) return;

    this.isUploading.set(true);

    this.uploadService.uploadDocument(this.data.servidorId, file)
      .pipe(finalize(() => this.isUploading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.success(
            `Arquivo <strong>${file.name}</strong> enviado com sucesso!`,
            'Upload PDF'
          );
          this.loadDocuments(); // Atualiza a lista
          this.clearSelection(); // Limpa o input com o arquivo
        },
        error: (err) => this.errorHandlerService.handle(err, 'Upload PDF')
      });
  }

  documentView(docId: number) {
    this.uploadService.getDocumentPreviewLink(docId).subscribe(url => {
      window.open(url, '_blank');
    });
  }

  // Exclui registro ativos
  deleteDocument(payload: DocumentUploadModel) {
    this.customDeleteService.execute(
      () => this.uploadService.deleteDocument(payload.id),
      () => {
        this.loadDocuments();
      },
      {
        title: 'Remoção PDF',
        message: `Esta ação não poderá ser desfeita. Excluir o doc.:
                  <strong class="text-red-600">${payload.originalName}</strong>?`,
        successMsg: `Documento: <strong>${payload.originalName}</strong> removido`
      }
    );
  }

  clearSelection() {
    this.selectedFile.set(null);
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }
}
