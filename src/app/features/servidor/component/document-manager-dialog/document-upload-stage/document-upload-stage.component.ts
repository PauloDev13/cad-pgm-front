import { ChangeDetectionStrategy, Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { StagedFile } from '../../../models/document-upload.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Definição dos limites em Bytes por arquivo
const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB

@Component({
  selector: 'app-document-upload-stage',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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

          <!-- ÁREA PARA VALIDAÇÃO DOS ARQUIVOS PDF QUE SERÃO ENVIADOS-->
          <div class="flex flex-col gap-2 max-h-70 overflow-y-auto pr-2">
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
                  (click)="removeFile.emit($index)"
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
                      Lote muito grande. {{ (totalSizeFilesValid() / 1024 / 1024).toFixed(2) }}
                  Máximo permitido é 20MB
                    </span>
              } @else {
                <span class="flex items-center text-green-600 font-semibold text-xs">
                      <mat-icon class="scale-75 !text-green-600">checked</mat-icon>
                        Total do lote: {{ (totalSizeFilesValid() / 1024 / 1024).toFixed(2) }} MB / 20 MB
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
                  (click)="clearSelection.emit()">
                  Cancelar Lote
                </button>
                <button
                  mat-flat-button
                  class="!bg-green-600 gap-2 !transition-transform duration-300 hover:!scale-105
                            disabled:!bg-gray-100"
                  (click)="sendBatch.emit()"
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
  `
})
export class DocumentUploadStageComponent {
// --- INPUTS (O que ele recebe do Pai) ---
  stagedFiles = input.required<StagedFile[]>();
  isUploading = input.required<boolean>();
  hasInvalidFiles = input.required<boolean>();
  totalFileInvalid = input.required<number>();
  totalSizeFilesValid = input.required<number>();
  isTotalSizeExceeded = input.required<boolean>();
  canUpload = input.required<boolean>();

  // --- OUTPUTS (O que ele avisa ao Pai) ---
  filesSelected = output<StagedFile[]>();
  // Emite o index do arquivo a ser removido da lista
  removeFile = output<number>();
  clearSelection = output<void>();
  sendBatch = output<void>();

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  // A lógica do onFileSelected fica aqui apenas para emitir o FileList
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;

    // Pega o FileList (lista de arquivos) inteiro
    const inputFiles = target.files;

    // Se a lista estiver nula ou vazia, aborta
    if (!inputFiles || inputFiles.length === 0) return;

    // Cria um array vazio para guardar os arquivos antes do envio
    const newStagedFiles: StagedFile[] = [];

    // Bloqueia: Barras (/ \), aspas (" '), pipes (|), asteriscos (*), e símbolos especiais (& % $ @ !).
    const regexValidCharacters = /^[a-zA-Z0-9 \-_\.\(\)\[\]À-ÿ]+$/;

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      let isValid = true;
      let errorMessage = '';

      // Validações
      if (file.type !== 'application/pdf') {
        isValid = false;
        errorMessage = 'Apenas arquivos PDF são permitidos.';
      } else if (file.size > MAX_FILE_SIZE) {
        isValid = false;
        errorMessage = `O tamanho individual do arquivo excede (1.5 MB).`;
      } else if (file.name.length > 50) {
        isValid = false;
        errorMessage = `O nome do arquivo é muito extenso. Renomeie para máximo (50) caracteres.`;
      } else if (!regexValidCharacters.test(file.name)) {
        isValid = false;
        errorMessage = `Nome com símbolos não permitidos. Renomeie o arquivo.`;
      }

      // Adiciona o arquivo selecionado ao array, se ele é válido
      // e se não for, adiciona a mensagem de erro
      newStagedFiles.push({ file, isValid, errorMessage });
    }
    // Emite a lista de objetos validados para o Pai!
    this.filesSelected.emit(newStagedFiles);

    // Limpa o input nativo para permitir selecionar o mesmo arquivo novamente
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }
}
