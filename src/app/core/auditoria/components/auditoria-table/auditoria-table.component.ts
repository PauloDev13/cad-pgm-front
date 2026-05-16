import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LoadingComponent } from '../../../../shared/components/loading.component/loading.component';
import { MatHeaderCellDef, MatTableModule } from '@angular/material/table';
import { AuditResponseDTO } from '../../models/audit-response.dto';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';

@Component({
  selector: 'app-auditoria-table',
  imports: [
    DatePipe,
    LoadingComponent,
    MatPaginatorModule,
    MatTableModule,
    MatHeaderCellDef
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col h-[calc(100vh-250px)] min-h-0 w-full max-w-full bg-white border border-gray-200
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

      <div class="flex-1 min-h-0 overflow-auto w-full custom-scrollbar print:overflow-visible print:h-auto">
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
          <span class="px-2 py-1 text-[10px] font-semibold rounded-full">
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
                class="font-semibold text-gray-800 !px-3 whitespace-nowrap print:text-black">
              ID
            </th>
            <td mat-cell *matCellDef="let row"
                class="text-gray-600 !px-3 min-w-4  print:whitespace-nowrap print:text-black
                      text-xs md:text-sm">
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

          <tr mat-header-row *matHeaderRowDef="displayedColumns(); sticky: true"
              class="bg-gray-100 border-b-2 border-gray-200 !h-auto z-10 print:bg-white
                     print:border-black">
          </tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns()"
              [class]="lineTableColor(row.typeAction)"
              class="transition-colors border-b border-gray-100 print:border-gray-300
                     print:!bg-transparent !h-auto py-1">
          </tr>

          <tr class="mat-row" *matNoDataRow>
            <td
              class="mat-cell p-8 !bg-red-600 !text-center text-white font-semibold
                     print:!bg-transparent print:!text-red-600"
              [colSpan]="displayedColumns().length">
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
          [pageSizeOptions]="[30, 50, 100]"
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
  router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

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

  // Cria um Signal reativo que será true em telas menores que 768px
  // (equivalente ao 'md' do Tailwind)
  isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(
      map(result => result.matches)
    ),
    { initialValue: false }
  );

  // Computa as colunas a serem exibidas com base no Signal isMobile
  displayedColumns = computed(() => {
    if (this.isMobile()) {
      return ['dateHourAction', 'username', 'details']; // Array para Mobile
    }
    return [
      'dateHourAction',
      'username',
      'typeAction',
      'affectedEntity',
      'idAffectedRecord',
      'details'
    ]; // Array para Desktop
  });

  // Adicione esta função dentro do seu componente de Auditoria
  lineTableColor(actionType: string): string {
    switch (actionType) {
      case 'INSERT':
        return '!bg-green-100 hover:!bg-green-200 [&>td]:!text-green-800';

      case 'UPDATE':
        // Usando azul para update (Destaca bem sem ser agressivo)
        return '!bg-blue-100 hover:!bg-blue-200 [&>td]:!text-blue-800';

      case 'DELETE':
        return '!bg-red-100 hover:!bg-red-200 [&>td]:!text-red-800';

      default:
        // O comportamento padrão (listrado) caso venha um tipo desconhecido,
        // ou um tipo que você não queira pintar (ex: 'LOGIN', 'READ')
        return 'odd:!bg-white even:!bg-gray-50 hover:!bg-gray-100';
    }
  }
}
