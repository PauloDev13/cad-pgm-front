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
import { MatCheckboxModule } from '@angular/material/checkbox';


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
    MatDialogModule,
    MatCheckboxModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full">
      <!-- TÍTULO E BOTÃO FECHAR-->
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
        @if (!selectedIds().length) {
          <!-- ÁREA PARA INCLUSÃO DOS ARQUIVOS PDF ENVIADOS AO BD-->
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
                  class="w-full sm:w-auto !bg-blue-500 gap-2 !transition-transform duration-300
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

                <!-- ÁREA PARA VALIDAÇÃO DOS ARQUIVOS PDF ENVIADOS AO BD-->
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

                  <!-- ÁREA PARA ENVIO DOS ARQUIVOS PDF AO BD-->
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
        }
        @if (stagedFiles().length === 0) {
          <div class="bg-white rounded-lg border border-gray-200 flex flex-col flex-1 min-h-0">

            <!-- ÁREA PARA REMOÇÃO DE ARQUIVOS PDF DO BD-->
            <div
              class="h-14 shrink-0 px-4 flex mb-2 items-center bg-blue-50 border-b border-blue-100
                    transition-all duration-300"
              [class.hidden]="selectedIds().length === 0"
            >
              <div class="flex flex-1 flex-col">
                <span class="text-blue-800 font-semibold text-sm">
                  {{
                    selectedIds().length > 1
                      ? selectedIds().length + ' arquivos selecionados'
                      : selectedIds().length + ' arquivo selecionado'
                  }}

                </span>
                <p class="text-xs text-gray-500 mt-1 sm:mt-0">
                  Os arquivos selecionados serão excluídos definitivamente
                </p>
              </div>

              <button
                mat-flat-button
                class="!bg-red-500 gap-2 !transition-transform duration-300 hover:!scale-105"
                (click)="deleteBatch()">
                <mat-icon>delete_sweep</mat-icon>
                Excluir Selecionados
              </button>
            </div>

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

              <!-- TABELA COM ARQUIVOS PDF JÁ ENVIADOS AO BD -->
              <div class="flex-1 overflow-auto w-full">
                <table mat-table [dataSource]="documents()" class="w-full">
                  <ng-container matColumnDef="select">
                    <th mat-header-cell *matHeaderCellDef class="px-4 w-[1%]">
                      <mat-checkbox
                        (change)="toggleAll($event.checked)"
                        [checked]="isAllSelected()"
                        [indeterminate]="isSomeSelected()"
                        color="primary">
                      </mat-checkbox>
                    </th>
                    <td mat-cell *matCellDef="let doc" class="px-4 w-[1%]">
                      <mat-checkbox
                        (click)="$event.stopPropagation()"
                        (change)="toggleRow(doc.id, $event.checked)"
                        [checked]="selectedIds().includes(doc.id)"
                        color="primary">
                      </mat-checkbox>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="originalName">
                    <th mat-header-cell *matHeaderCellDef class="font-semibold px-4">
                      Arquivo
                    </th>

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
  /* =========================================
                    INJEÇÃO DE DEPENDÊNCIAS
     ========================================= */
  // Recebe o ID do servidor através do DATA do MatDialog
  data = inject(MAT_DIALOG_DATA);
  private uploadService = inject(UploadService);
  private customDeleteService = inject(CustomDeleteService);
  private notificationService = inject(NotificationService);
  private errorHandlerService = inject(ErrorHandlerService);

  /* =========================================
                    VARIÁVEIS DIVERSAS
     ========================================= */
  displayedColumns = ['select', 'originalName', 'dataUpload', 'formatedSize', 'acoes'];

  // Para limpar o input nativo caso o usuário cancele
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  /* =========================================
                    SIGNALS
     ========================================= */
  documents = signal<DocumentUploadModel[]>([]);
  isUploading = signal(false);
  isLoadingList = signal(false);

  // Signal para exclusão em lote
  selectedIds = signal<number[]>([]);

  // Signal para guardar a lista de arquivos na "Área de Preparação"
  stagedFiles = signal<StagedFile[]>([]);

  /* =========================================
                    COMPUTEDS
     ========================================= */
  // Computed que verifica se TODOS os documentos PDF estão selecionados
  isAllSelected = computed(() => {
    const docs = this.documents();
    const selected = this.selectedIds();
    return docs.length > 0 && selected.length === docs.length;
  });

  // Computed que verifica se APENAS ALGUNS estão selecionados (Gera o tracinho no checkbox)
  isSomeSelected = computed(() => {
    const selected = this.selectedIds().length;
    return selected > 0 && selected < this.documents().length;
  });

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

  ngOnInit() {
    this.loadDocuments();
  }

  /* =========================================
                    MÉTODOS
     ========================================= */

  // Carrega todos os documento PDF
  loadDocuments() {
    this.isLoadingList.set(true);

    this.uploadService.listDocuments(this.data.servidorId)
      .pipe(finalize(() => this.isLoadingList.set(false)))
      .subscribe(docs => this.documents.set(docs));
  }

  // Seleciona os arquivos PDF que serão enviados
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

  // Remove um arquivo específico da área de preparação (lista com os arquivos a serem enviados)
  removeStagedFile(index: number) {
    this.stagedFiles.update(current => current.filter(
      (_, i) => i !== index));
  }

  // Envia o arquivo PDF para o MinIO e grava os dados no banco
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

  // Gera o link para a visualização do arquivo PDF
  documentView(docId: number) {
    this.uploadService.getDocumentPreviewLink(docId).subscribe(url => {
      window.open(url, '_blank');
    });
  }

  // Controla a seleção múltipla de arquivos PDF para a remoção em lote
  toggleAll(checked: boolean) {
    if (checked) {
      // Pega todos os IDs da tabela e joga no Signal
      this.selectedIds.set(this.documents().map(doc => doc.id));
    } else {
      this.selectedIds.set([]); // Limpa tudo
    }
  }

  // Atualiza o signal que guarda os IDs dos documentos que serão removidos em lote
  toggleRow(id: number, checked: boolean) {
    this.selectedIds.update(ids => {
      if (checked) {
        return [...ids, id]; // Adiciona o ID
      } else {
        return ids.filter(i => i !== id); // Remove o ID
      }
    });
  }

  // Remove o lote de arquivos PDFs selecionados
  deleteBatch() {
    const idsToExclude = this.selectedIds();

    // Se a lista de IDs está vazia, não faz nada
    if (idsToExclude.length === 0) return;

    // Chama o serviço que contem o dialog de confirmação
    this.customDeleteService.execute(
      () => this.uploadService.deleteDocumentBatch(idsToExclude),
      () => {
        this.isLoadingList.set(true);
        this.selectedIds.set([]); // Limpa a seleção após excluir
        this.loadDocuments();
      },
      {
        title: 'Remoção PDF',
        message: `Esta ação não poderá ser desfeita. Confirma a remoção de
        <strong class="text-red-600">${idsToExclude.length} ${idsToExclude.length > 1 ? 'arquivos' : 'arquivo'}</strong>?`,
        successMsg: `<strong>${idsToExclude.length}</strong> ${idsToExclude.length > 1 ? ' arquivos removidos' : ' arquivo removido'}
                    com sucesso.`
      }
    );
  }

  // Exclui um documento PDF por vez
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

  // Limpa a lista de arquivos PDF após o envio o cancelamento
  clearSelection() {
    this.stagedFiles.set([]);
  }
}
