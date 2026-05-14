import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
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
      class="flex flex-col h-full min-h-0 w-full max-w-full bg-white border border-gray-200
            rounded-xl relative overflow-hidden print:border-none print:shadow-none print:block
            print:h-auto print:overflow-visible"
    >

      <div class="hidden print:block mb-4 text-center border-b border-black pb-2 pt-4">
        <h2 class="text-2xl font-bold uppercase text-black">Relatório de Auditoria</h2>
        <p class="text-sm text-gray-700">
          Usuário: {{ username() || 'Todos' }} - Tipo de Ação: {{ actionType() || 'Todas' }}
        </p>
        <p class="text-sm text-gray-700">
          Período: {{ dateStart() ? (dateStart() | date:'dd/MM/yyyy') : '' }} até
          {{ dateEnd() ? (dateEnd() | date:'dd/MM/yyyy') : (currentDate() | date:'dd/MM/yyyy') }}
        </p>
      </div>

      <div
        class="absolute inset-0 z-50 bg-white/60 flex justify-center items-center backdrop-blur-sm
               transition-opacity duration-300 print:hidden"
        [class.opacity-0]="!isLoading()"
        [class.opacity-100]="isLoading()"
        [class.pointer-events-none]="!isLoading()">
        <app-loading [isLoading]="true" />
      </div>

      <div class="flex-1 overflow-auto w-full custom-scrollbar print:overflow-visible print:h-auto">
        <table mat-table [dataSource]="dataAudit()" class="w-full print-full-width">

          <ng-container matColumnDef="dateHourAction">
            <th mat-header-cell *matHeaderCellDef
                class="font-semibold text-gray-800 !px-3 w-[1%] whitespace-nowrap print:text-black">
              Data / Hora
            </th>
            <td mat-cell *matCellDef="let row"
                class="text-gray-600 whitespace-nowrap !px-3 w-[1%] print:text-black text-xs md:text-sm">
              {{ row.dateHourAction | date:'dd/MM/yyyy HH:mm:ss' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef
                class="hidden md:table-cell font-semibold text-gray-800 !px-3 w-[1%] whitespace-nowrap print:hidden">
              Usuário
            </th>
            <td mat-cell *matCellDef="let row"
                class="hidden md:table-cell font-medium text-gray-800 !px-3 w-[1%] whitespace-nowrap
                      print:hidden text-xs md:text-sm">
              {{ row.username }}
            </td>
          </ng-container>

          <ng-container matColumnDef="typeAction">
            <th mat-header-cell *matHeaderCellDef
                class="hidden md:table-cell font-semibold text-gray-800 text-center !px-3 w-[1%]
                      whitespace-nowrap print:hidden">
              Ação
            </th>
            <td mat-cell *matCellDef="let row"
                class="hidden md:table-cell text-center !px-3 w-[1%] whitespace-nowrap print:hidden">
          <span class="px-2 py-1 text-[10px] font-semibold rounded-full"
                [ngClass]="{
                'bg-green-100 text-green-800': row.typeAction === 'INSERT',
                'bg-blue-100 text-blue-800': row.typeAction === 'UPDATE',
                'bg-red-100 text-red-800': row.typeAction === 'DELETE'}">
            {{ row.typeAction }}
          </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="affectedEntity">
            <th mat-header-cell *matHeaderCellDef
                class="hidden lg:table-cell font-semibold text-gray-800 !px-3 print:portrait:hidden
                      print:landscape:table-cell print:text-black">
              Entidade
            </th>
            <td mat-cell *matCellDef="let row"
                class="hidden lg:table-cell text-gray-600 !px-3 print:portrait:hidden
                      print:landscape:table-cell print:text-black text-xs md:text-sm">
              {{ row.affectedEntity }}
            </td>
          </ng-container>

          <ng-container matColumnDef="idAffectedRecord">
            <th mat-header-cell *matHeaderCellDef
                class="font-semibold text-gray-800 !px-3 w-[1%] whitespace-nowrap print:text-black">
              ID
            </th>
            <td mat-cell *matCellDef="let row"
                class="text-gray-600 !px-3 w-[1%] print:text-black text-xs md:text-sm">
              {{ row.idAffectedRecord }}
            </td>
          </ng-container>

          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef
                class="font-semibold text-gray-800 !px-3 print:text-black">
              Detalhes / Alterações
            </th>
            <td mat-cell *matCellDef="let row"
                class="text-gray-600 !px-3 py-2 print:text-black text-xs md:text-sm break-words min-w-[200px]"
                [title]="row.details">
              {{ row.details }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"
              class="bg-gray-100 border-b-2 border-gray-200 print:bg-white print:border-black !h-10 z-10">
          </tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"
              class="odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50 transition-colors border-b
                      border-gray-100 print:border-gray-300 print:!bg-transparent !h-auto py-1">
          </tr>

          <tr class="mat-row" *matNoDataRow>
            <td
              class="mat-cell p-8 !bg-red-600 !text-center text-white font-semibold
                     print:!bg-transparent print:!text-red-600"
              [colSpan]="displayedColumns.length">
              Nenhum registro encontrado.
            </td>
          </tr>
        </table>
      </div>

      <div class="shrink-0 print:hidden w-full bg-white border-t border-gray-200 rounded-b-xl z-20">
        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageIndex]="currentPage()"
          [pageSizeOptions]="[15, 30, 50]"
          [showFirstLastButtons]="true"
          (page)="pageChange.emit($event)">
        </mat-paginator>
      </div>

      <div class="hidden print:block mt-2 text-right border-t border-black pt-1">
        <span class="text-xs font-bold">Total: {{ dataAudit().length }} registro(s)</span>
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
  currentDate = signal<Date>(new Date());
  username = input.required<string>();
  actionType = input.required<string>();

  pageChange = output<PageEvent>();

  // Configuração das colunas da tabela
  displayedColumns = [
    'dateHourAction', 'username', 'typeAction', 'affectedEntity', 'idAffectedRecord', 'details'
  ];
}
