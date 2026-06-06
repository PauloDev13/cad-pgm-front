import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { UploadService } from '../../services/upload.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { DocumentUploadModel, StagedFile } from '../../models/document-upload.model';
import { finalize } from 'rxjs';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomDeleteService } from '../../../../shared/service/custom-delete.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { rxResource } from '@angular/core/rxjs-interop';
import { DocumentUploadStageComponent } from './document-upload-stage/document-upload-stage.component';
import { DocumentListTableComponent } from './document-list-table/document-list-table.component';

// Definição dos limites em Bytes total por lote
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 20 MB

@Component({
  selector: 'app-document-manager',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatCheckboxModule,
    DocumentUploadStageComponent,
    DocumentListTableComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-white overflow-hidden rounded-xl">
      <!-- TÍTULO E BOTÃO FECHAR-->
      <div class="flex justify-between items-center px-4 md:px-6 py-4 border-b border-gray-200 shrink-0">
        <h2 class="text-lg md:text-xl font-bold text-blue-700 m-0">Anexos</h2>
      </div>

      <div class="flex flex-col h-[calc(100vh-50%)]  p-4 md:p-3 bg-gray-50 gap-3 min-h-0">
        @if (!selectedIds().length) {
          <!-- CHAMA O COMPONENTE QUE GUARDA OS ARQUIVOS PDF A SEREM ENVIADOS-->
          <app-document-upload-stage
            [class]="stagedFiles().length === 0
              ? 'block w-full shrink-0'
              : 'flex flex-col flex-1 min-h-0 w-full'"
            [stagedFiles]="stagedFiles()"
            [isUploading]="isUploading()"
            [hasInvalidFiles]="hasInvalidFiles()"
            [totalFileInvalid]="totalFileInvalid()"
            [totalSizeFilesValid]="totalSizeFilesValid()"
            [isTotalSizeExceeded]="isTotalSizeExceeded()"
            [canUpload]="canUpload()"

            (filesSelected)="onFileSelected($event)"
            (removeFile)="removeStagedFile($event)"
            (clearSelection)="clearSelection()"
            (sendBatch)="sendPdfFile()"
          />
        }
        @if (stagedFiles().length === 0) {
          <!-- CHAMA O COMPONENTE QUE EXIBE OS ARQUIVOS PDF ENVIADOS E SALVOS-->
          <div class="flex-1 relative min-h-0 w-full">
            <app-document-list-table
              [documents]="documents()"
              [selectedIds]="selectedIds()"
              [isLoading]="isLoadingList()"
              [isAllSelected]="isAllSelected()"
              [isSomeSelected]="isSomeSelected()"

              (toggleAll)="toggleAll($event)"
              (toggleRow)="toggleRow($event.id, $event.checked)"
              (deleteBatch)="deleteBatch()"
              (viewDocument)="documentView($event)"
            />
          </div>
        }
      </div>
    </div>
  `
})

export class DocumentManagerComponent {

  // ================ INJEÇÃO DE DEPENDÊNCIAS ========================
  // Recebe o ID do servidor através do DATA do MatDialog
  // protected data = inject(MAT_DIALOG_DATA);
  private uploadService = inject(UploadService);
  private customDeleteService = inject(CustomDeleteService);
  private notificationService = inject(NotificationService);
  private errorHandlerService = inject(ErrorHandlerService);

  // Para limpar o input nativo caso o usuário cancele
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  servidorId = input.required<number>();
  // SIGNALS
  isUploading = signal(false);
  // Signal para exclusão em lote
  selectedIds = signal<number[]>([]);
  // Signal para guardar a lista de arquivos na "Área de Preparação"
  stagedFiles = signal<StagedFile[]>([]);

// ============= COMPUTED =======================
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

  // Usa o totalFileInvalid para calcula o tamanho total do lote só com os arquivos válidos
  totalSizeFilesValid = computed(() => {
    return this.stagedFiles().filter(f => f.isValid)
      .reduce((total, { file }) => total + file.size, 0);
  });

  // Retorna verdadeiro se o tamanho total dos arquivos ultrapassar 20MB
  isTotalSizeExceeded = computed(() =>
    this.totalSizeFilesValid() > MAX_TOTAL_SIZE);

  // O botão de enviar só acende se houver arquivos, não contiver arquivos inválidos,
  // o total do lote não exceder o tamanho de 20 MB e não estiver em processo de envio
  // de arquivos
  canUpload = computed(() =>
    this.stagedFiles().length > 0 &&
    !this.hasInvalidFiles() &&
    !this.isTotalSizeExceeded() &&
    !this.isUploading()
  );

  constructor() {
    effect(() => {
      const err = this.documentsResource.error();

      if (err) {
        this.errorHandlerService.handle(err, 'Arquivo PDF');
      }
    });
  }

  // =========== MÉTODOS ===============

  // Carrega todos os documento PDF
  documentsResource = rxResource({
    params: () => ({
      id: Number(this.servidorId())
    }),
    stream: ({ params }) => {
      return this.uploadService.listDocuments(params.id);
    }
  });


  documents = computed(() => this.documentsResource.value() ?? []);

  isLoadingList = this.documentsResource.isLoading;

  // Envia o arquivo PDF para o MinIO e grava os dados no banco
  sendPdfFile() {
    const filesToSend = this.stagedFiles().filter(f => f.isValid)
      .map(f => f.file);

    if (filesToSend.length === 0) return;

    this.isUploading.set(true);

    this.uploadService.uploadDocument(this.servidorId(), filesToSend)
      .pipe(finalize(() => this.isUploading.set(false)))
      .subscribe({
        next: () => {
          this.notificationService.success(
            `<strong>${filesToSend.length} arquivo(s)</strong> enviado com sucesso!`,
            'Upload PDF'
          );
          this.documentsResource.reload();
          this.clearSelection(); // Limpa o input com o arquivo
        },
        error: (err) => this.errorHandlerService.handle(err, 'Upload PDFs')
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
        this.selectedIds.set([]); // Limpa a seleção após excluir
        this.documentsResource.reload();
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

  // Seleciona os arquivos PDF que serão enviados
  onFileSelected(newValidatedFiles: StagedFile[]) {
    // Se não chegou nada, aborta
    if (!newValidatedFiles || newValidatedFiles.length === 0) return;

    // Apenas atualiza o estado (Signal) adicionando os novos arquivos à lista
    this.stagedFiles.update(current => [...current, ...newValidatedFiles]);
  }

  // Remove um arquivo específico da área de preparação (lista com os arquivos a serem enviados)
  removeStagedFile(index: number) {
    this.stagedFiles.update(current => current.filter(
      (_, i) => i !== index));
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

  // Exclui um documento PDF por vez
  deleteDocument(payload: DocumentUploadModel) {
    this.customDeleteService.execute(
      () => this.uploadService.deleteDocument(payload.id),
      () => {
        this.documentsResource.reload();
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
