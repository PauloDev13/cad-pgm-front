import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UploadService } from '../../services/upload.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { DocumentUploadModel, StagedFile } from '../../models/document-upload.model';
import { finalize } from 'rxjs';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomDeleteService } from '../../../../shared/service/custom-delete.service';


// Definição dos limites em Bytes
const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 20 MB

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
          class="!w-8 !h-8 !flex !items-center !justify-center !bg-blue-600 hover:!bg-blue-500
                  !transition-colors !duration-300"
        >
          <mat-icon class="!text-white !scale-90 !leading-none !m-0 !p-0">close</mat-icon>
        </button>
      </div>

      <div class="p-4 md:p-4 flex flex-1 flex-col bg-gray-50 min-h-0">

        <div
          class="bg-white p-0 rounded-lg border border-gray-200 mb-2 shrink-0 transition-all
                 duration-300">
          <input
            type="file"
            multiple
            #fileInput
            class="hidden"
            accept=".pdf,application/pdf"
            (change)="onFileSelected($event)">

          @if (stagedFiles().length === 0) {
            <div
              class="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4
                    bg-blue-50 px-4 py-4 sm:py-2 rounded-md border border-blue-100 flex-1 w-full
                    text-center sm:text-left">
              <div>
                <h3 class="font-semibold text-blue-700 text-sm">Anexar Arquivos (lote)</h3>
                <p class="text-xs text-gray-500 mt-1 sm:mt-0">
                  Formato aceito: PDF (Máx. 1.5 MB por arquivo)
                </p>
              </div>

              <button
                mat-flat-button
                class="w-full sm:w-auto !bg-blue-700 gap-2 !transition-transform duration-300
                      hover:!scale-105"
                (click)="fileInput.click()">
                <mat-icon>add_photo_alternate</mat-icon>
                Selecionar PDFs
              </button>
            </div>
          } @else {
            <div class="flex flex-col gap-4">

              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-semibold text-gray-700">
                  Total de {{ stagedFiles().length }} anexos no lote

                  @if (totalFileInvalid() > 0) {
                    - {{
                      totalFileInvalid() > 1
                        ? 'Inválidos:'
                        : 'Inválido:'
                    }} {{ totalFileInvalid() }} - Válidos: {{ stagedFiles().length - totalFileInvalid() }}
                  }
                </h3>
                <button
                  mat-stroked-button
                  class="w-full sm:w-auto !border-blue-600 !text-blue-600 !transition-transform duration-300
                        hover:!scale-105 disabled:!border-gray-300 disabled:!text-gray-400"
                  (click)="fileInput.click()"
                  [disabled]="isUploading()">
                  <mat-icon>add</mat-icon>
                  Adicionar mais
                </button>
              </div>

              <div class="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                @for (item of stagedFiles(); track $index) {

                  <div class="flex items-center justify-between px-4 py-2 rounded-md border"
                       [class]="item.isValid ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-200'">

                    <div class="flex items-center gap-3 overflow-hidden">
                      <mat-icon [class]="item.isValid ? '!text-blue-500' : '!text-red-500'">
                        {{ item.isValid ? 'picture_as_pdf' : 'error' }}
                      </mat-icon>
                      <div class="flex flex-col overflow-hidden">
                        <span class="font-semibold text-sm truncate"
                              [class]="item.isValid ? 'text-gray-700' : 'text-gray-500'"
                              [matTooltip]="item.file.name">
                          {{ item.file.name }}
                        </span>

                        @if (item.isValid) {
                          <span class="text-xs text-gray-500">
                            {{ (item.file.size / 1024 / 1024).toFixed(2) }} MB
                          </span>
                        } @else {
                          <span class="text-xs font-bold text-red-600">
                            {{ item.errorMessage }}
                          </span>
                        }
                      </div>
                    </div>

                    <button
                      mat-icon-button
                      class="!scale-80 !bg-blue-400 hover:!scale-90 !text-white hover:!bg-red-400
                            !transition-transform duration-300 "
                      (click)="removeStagedFile($index)"
                      matTooltip="Remover"
                      [disabled]="isUploading()">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>

              <div class="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3 border-t">
                <div class="text-sm flex flex-col gap-1">
                  @if (hasInvalidFiles()) {
                    <span class="text-red-600 font-semibold flex items-center gap-1">
                      <mat-icon class="scale-75">report_problem </mat-icon>
                      Remova os arquivos marcados em vermelho.
                    </span>
                  } @else if (isTotalSizeExceeded()) {
                    <span class="text-red-600 font-semibold flex items-center gap-1">
                      <mat-icon class="scale-75">warning</mat-icon>
                      Lote muito grande. {{ (totaSizeFilesValid() / 1024 / 1024).toFixed(2) }}
                      Máximo permitido é 20MB
                    </span>
                  } @else {
                    <span class="flex items-center text-green-600 font-semibold text-xs">
                      <mat-icon class="scale-75 !text-green-600">checked</mat-icon>
                        Total do lote: {{ (totaSizeFilesValid() / 1024 / 1024).toFixed(2) }} MB / 20 MB
                     </span>
                  }
                </div>

                <div class="flex items-center gap-2">
                  @if (isUploading()) {
                    <div class="flex items-center text-blue-600 text-sm font-medium gap-2 mr-2">
                      <mat-spinner diameter="20"></mat-spinner>
                      Enviando lote...
                    </div>
                  } @else {
                    <button
                      mat-stroked-button
                      class="w-full sm:w-auto !border-blue-600 !text-blue-600 !transition-transform
                            duration-300 hover:!scale-105"
                      (click)="clearSelection()">
                      Cancelar Lote
                    </button>
                    <button
                      mat-flat-button
                      class="!bg-green-600 gap-2 !transition-transform duration-300 hover:!scale-105
                            disabled:!bg-gray-100"
                      (click)="sendPdfFile()"
                      [disabled]="!canUpload()">
                      <mat-icon>cloud_upload</mat-icon>
                      Enviar Lote
                    </button>
                  }
                </div>
              </div>

            </div>
          }
        </div>

        @if (stagedFiles().length === 0) {

          <div class="bg-white rounded-lg border border-gray-200 flex flex-col flex-1 min-h-0">

            @if (isLoadingList()) {
              <div class="flex justify-center items-center flex-1 p-8">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
            } @else if (documents().length === 0) {
              <div class="flex justify-center items-center flex-1 p-4 gap-2 text-red-500">
                <mat-icon class="text-4xl !text-red-500">description</mat-icon>
                <p>Nenhum documento anexado a este servidor.</p>
              </div>
            } @else {
              <div class="flex-1 overflow-auto w-full">
                <table mat-table [dataSource]="documents()" class="w-full">

                  <ng-container matColumnDef="originalName">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold px-4">Arquivo</th>

                    <td mat-cell *matCellDef="let doc"
                        class="font-medium text-gray-700 px-4 w-full max-w-0"
                        [matTooltip]="doc.originalName">
                      <div class="flex items-center gap-2">
                        <mat-icon class="!text-red-500 shrink-0">picture_as_pdf</mat-icon>
                        <span class="truncate block">{{ doc.originalName }}</span>
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
                    <th
                      mat-header-cell
                      *matHeaderCellDef
                      class="hidden md:table-cell font-semibold text-center px-4">
                      Tamanho
                    </th>
                    <td
                      mat-cell
                      *matCellDef="let doc"
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
                    mat-row
                    *matRowDef="let row; columns:displayedColumns"
                    class="!h-10 odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50
                            transition-colors cursor-pointer border-gray-100">
                  </tr>
                </table>
              </div>
            }
          </div>
        }
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
  // selectedFile = signal<File | null>(null);

  // Signal para guardar a lista de arquivos na "Área de Preparação"
  stagedFiles = signal<StagedFile[]>([]);

  // Verifica se há pelo menos um arquivo problemático na lista
  hasInvalidFiles = computed(
    () => this.stagedFiles().some(f => !f.isValid));


  // Filtra do lote apenas os arquivos válidos
  totalFileInvalid = computed(() => this.stagedFiles()
    .filter(f => !f.isValid).length
  );

  // Usa o totalFileInvalid para alcula o tamanho total do lote só com os arquivos válidos
  totaSizeFilesValid = computed(() => {
    return this.stagedFiles().filter(f => f.isValid)
      .reduce((total, { file }) => total + file.size, 0);
  });

  // Retorna verdadeiro se o tamanho total dos arquivos ultrapassar 20MB
  isTotalSizeExceeded = computed(() =>
    this.totaSizeFilesValid() > MAX_TOTAL_SIZE);

  // O botão de enviar só acende se houver arquivos, não contiver arquivos inválidos,
  // o total do lote não exceder o tamanho de 20 MB e não estiver em processo de envio
  // de arquivos
  canUpload = computed(() =>
    this.stagedFiles().length > 0 &&
    !this.hasInvalidFiles() &&
    !this.isTotalSizeExceeded() &&
    !this.isUploading()
  );


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
    // Agora pegamos o FileList (lista de arquivos) inteiro
    const inputFiles: FileList = event.target.files;
    // Se a lista estiver nula ou vazia, aborta
    if (!inputFiles || inputFiles.length === 0) return;

    const newStagedFiles: StagedFile[] = [];
    // Bloqueia: Barras (/ \), aspas (" '), pipes (|), asteriscos (*), e símbolos especiais (& % $ @ !).
    const regexValidCharacters = /^[a-zA-Z0-9 \-_\.\(\)\[\]À-ÿ]+$/;

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      let isValid = true;
      let errorMessage = '';

      if (file.type !== 'application/pdf') {
        isValid = false;
        errorMessage = 'Apenas arquivos PDF são permitidos.';

        // 2. Validação de Tamanho (Máx: 1.5MB)
      } else if (file.size > MAX_FILE_SIZE) {
        isValid = false;
        errorMessage = `O tamanho individual do arquivo excede (1.5 MB).`;

        // Validação do tamnho do nome do arquivo, já com a extensão .pdf)
      } else if (file.name.length > 50) {
        isValid = false;
        errorMessage = `O nome do arquivo é muito extenso. Renomeie para máximo (50) caracteres).`;

      } else if (!regexValidCharacters.test(file.name)) {
        isValid = false;
        errorMessage = `O nome do arquivo com símbolos não permitidos
                        (aspas, barras ou %, $, @). Renomei o arquivo`;
      }

      newStagedFiles.push({ file, isValid, errorMessage });
    }

    // Adiciona os novos arquivos aos que já estavam na área de preparação
    this.stagedFiles.update(current => [...current, ...newStagedFiles]);

    // Reseta o input nativo para permitir selecionar o mesmo arquivo novamente se necessário
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  // Remove um arquivo específico da área de preparação
  removeStagedFile(index: number) {
    this.stagedFiles.update(current => current.filter(
      (_, i) => i !== index));
  }

  sendPdfFile() {
    const filesToSend = this.stagedFiles().filter(f => f.isValid)
      .map(f => f.file);

    if (filesToSend.length === 0) return;

    this.isUploading.set(true);

    this.uploadService.uploadDocument(this.data.servidorId, filesToSend)
      .pipe(finalize(() => this.isUploading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.success(
            `<strong>${filesToSend.length} arquivo(s)</strong> enviado com sucesso!`,
            'Upload PDF'
          );
          this.loadDocuments(); // Atualiza a lista
          this.clearSelection(); // Limpa o input com o arquivo
        },
        error: (err) => this.errorHandlerService.handle(err, 'Upload PDFs')
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
    this.stagedFiles.set([]);
  }
}
