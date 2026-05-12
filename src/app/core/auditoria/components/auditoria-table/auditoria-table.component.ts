import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { LoadingComponent } from '../../../../shared/components/loading.component/loading.component';
import { MatHeaderCellDef, MatTableModule } from '@angular/material/table';
import { AuditResponseDTO } from '../../models/audit-response.dto';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-auditoria-table',
  imports: [
    DatePipe,
    LoadingComponent,
    MatPaginatorModule,
    MatTableModule,
    MatHeaderCellDef,
    NgClass
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col flex-1 h-full min-h-0 bg-white border border-gray-200 rounded-xl
         relative print:shadow-none print:border-none print:block print:h-auto print:overflow-visible"
    >

      <div class="overflow-auto w-full flex-1 print:overflow-visible">

        <div class="hidden print:block mb-4 text-center border-b border-black pb-2 pt-4">
          <h2 class="text-2xl font-bold uppercase text-black">Relatório de Auditoria</h2>
          <p class="text-sm text-gray-700">Impresso em: {{ dateStart() | date:'dd/MM/yyyy' }}
            a {{ dateEnd()| date:'dd/MM/yyyy' }}</p>
        </div>

        <div
          class="absolute inset-0 z-50 bg-white/60 flex justify-center items-center backdrop-blur-sm
             transition-opacity duration-300 print:hidden"
          [class.opacity-0]="!isLoading()"
          [class.opacity-100]="isLoading()"
          [class.pointer-events-none]="!isLoading()">
          <app-loading [isLoading]="true" />
        </div>

        <table mat-table [dataSource]="dataAudit()" class="w-full">

          <ng-container matColumnDef="dateHourAction">
            <th mat-header-cell *matHeaderCellDef
                class="font-semibold text-gray-800 !px-3 w-[1%] whitespace-nowrap print:text-black">
              Data / Hora
            </th>
            <td mat-cell *matCellDef="let row"
                class="text-gray-600 whitespace-nowrap !px-3 w-[1%] print:text-black">
              {{ row.dateHourAction | date:'dd/MM/yyyy HH:mm:ss' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef
                class="font-semibold text-gray-800 !px-3 w-[1%] whitespace-nowrap print:text-black">
              Usuário
            </th>
            <td mat-cell *matCellDef="let row"
                class="font-medium text-gray-800 !px-3 w-[1%] whitespace-nowrap print:text-black">
              {{ row.username }}
            </td>
          </ng-container>

          <ng-container matColumnDef="typeAction">
            <th mat-header-cell *matHeaderCellDef
                class="font-semibold text-gray-800 text-center !px-3 w-[1%] whitespace-nowrap print:text-black">
              Ação
            </th>
            <td mat-cell *matCellDef="let row" class="text-center !px-3 w-[1%] whitespace-nowrap">
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full print:border print:border-gray-400 print:text-black print:bg-transparent"
            [ngClass]="{
                  'bg-green-100 text-green-800': row.typeAction === 'INSERT',
                  'bg-blue-100 text-blue-800': row.typeAction === 'UPDATE',
                  'bg-red-100 text-red-800': row.typeAction === 'DELETE'
                }">
            {{ row.typeAction }}
          </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="affectedEntity">
            <th mat-header-cell *matHeaderCellDef
                class="hidden md:table-cell font-semibold text-gray-800 !px-3 print:table-cell print:text-black">
              Entidade
            </th>
            <td mat-cell *matCellDef="let row"
                class="hidden md:table-cell text-gray-600 !px-3 print:table-cell print:text-black">
              {{ row.affectedEntity }}
            </td>
          </ng-container>

          <ng-container matColumnDef="idAffectedRecord">
            <th mat-header-cell *matHeaderCellDef
                class="hidden lg:table-cell font-semibold text-gray-800 !px-3 print:table-cell print:text-black">
              Identificação
            </th>
            <td mat-cell *matCellDef="let row"
                class="hidden lg:table-cell text-gray-600 !px-3 print:table-cell print:text-black">
              {{ row.idAffectedRecord }}
            </td>
          </ng-container>

          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef
                class="hidden sm:table-cell font-semibold text-gray-800 !px-3 print:table-cell print:text-black">
              Detalhes / Alterações
            </th>
            <td mat-cell *matCellDef="let row"
                class="hidden sm:table-cell font-medium text-gray-600 !px-3 max-w-[150px] md:max-w-xs truncate print:table-cell print:max-w-none print:whitespace-normal print:text-black"
                [title]="row.details">
              {{ row.details }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"
              class="bg-gray-50 border-b-2 border-gray-200 print:bg-white print:border-black
                 !h-10 relative z-10">
          </tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"
              class="odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50 transition-colors
                 border-b border-gray-100 print:border-gray-300 print:!bg-transparent print:!text-black !h-8">
          </tr>

          <tr class="mat-row" *matNoDataRow>
            <td [colSpan]="displayedColumns.length"
                class="mat-cell p-4 md:p-8 !bg-red-600 !text-center text-white text-base
                   md:text-sm md:font-semibold print:!bg-transparent print:!text-red-600 print:border-none">
              Nenhum registro de AUDITORIA encontrado para os filtros informados.
            </td>
          </tr>
        </table>
      </div>

      <div class="shrink-0 print:hidden w-full bg-white border-t border-gray-200 rounded-b-xl z-20 relative">
        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageIndex]="currentPage()"
          [pageSizeOptions]="[15, 30, 50]"
          [showFirstLastButtons]="true"
          (page)="pageChange.emit($event)">
        </mat-paginator>
      </div>
    </div>
  `
})
export class AuditoriaTableComponent {
  // INPUTS DE ESTADO DA TABELA
  dataAudit = input.required<AuditResponseDTO[]>();
  isLoading = input.required<boolean>();
  totalElements = input.required<number>();
  pageSize = input.required<number>();
  currentPage = input.required<number>();
  dateStart = input.required<Date | null>();
  dateEnd = input.required<Date | null>();

  pageChange = output<PageEvent>();

  // Configuração das colunas da tabela
  displayedColumns = [
    'dateHourAction', 'username', 'typeAction', 'affectedEntity', 'idAffectedRecord', 'details'
  ];
}
