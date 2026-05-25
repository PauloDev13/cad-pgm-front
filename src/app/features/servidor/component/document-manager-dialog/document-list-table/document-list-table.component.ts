import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DocumentUploadModel } from '../../../models/document-upload.model';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-document-list-table',
  imports: [
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
          (click)="deleteBatch.emit()">
          <mat-icon>delete_sweep</mat-icon>
          Excluir Selecionados
        </button>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center flex-1 p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (documents().length === 0) {
        <div class="flex justify-center items-center flex-1 p-4 gap-2 text-red-500">
          <mat-icon class="text-4xl !text-red-500">description</mat-icon>
          <p>Nenhum documento anexado a este servidor.</p>
        </div>
      } @else {

        <!-- TABELA COM ARQUIVOS PDF JÁ ENVIADOS E SALVOS -->
        <div class="flex-1 overflow-auto max-h-80 w-full">
          <table mat-table [dataSource]="documents()" class="w-full">
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef class="px-4 w-[1%]">
                <mat-checkbox
                  (change)="toggleAll.emit($event.checked)"
                  [checked]="isAllSelected()"
                  [indeterminate]="isSomeSelected()"
                  color="primary">
                </mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let doc" class="px-4 w-[1%]">
                <mat-checkbox
                  (click)="$event.stopPropagation()"
                  (change)="toggleRow.emit({id: doc.id, checked: $event.checked})"
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
                    (click)="viewDocument.emit(doc.id)">
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
  `
})
export class DocumentListTableComponent {
  // --- INPUTS (Recebe do Pai) ---
  documents = input.required<DocumentUploadModel[]>();
  selectedIds = input.required<number[]>();
  isLoading = input.required<boolean>();
  isAllSelected = input.required<boolean>();
  isSomeSelected = input.required<boolean>();

  // --- OUTPUTS (Avisa o Pai) ---
  toggleAll = output<boolean>();
  toggleRow = output<{ id: number, checked: boolean }>();
  deleteBatch = output<void>();
  viewDocument = output<number>(); // Emite o ID para visualização

  displayedColumns = ['select', 'originalName', 'dataUpload', 'formatedSize', 'acoes'];
}
