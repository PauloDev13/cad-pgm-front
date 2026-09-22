import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DateTime } from 'luxon';
import { ProcuradorResponseDTO } from '../../models/procurador.model';
import { LoadingComponent } from '../../../../shared/components/loading.component/loading.component';

// export interface ExpiracaoStatus {
//   label: string;
//   cssClass: string;
//   icon: string;
// }

@Component({
  selector: 'app-procurador-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    LoadingComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="
      flex flex-col w-full border border-gray-300 rounded-lg overflow-hidden
      relative bg-white h-[calc(100dvh-406px)] min-h-[320px] md:min-h-[505px]"
    >
      <!-- Loading Overlay -->
      <div
        class="absolute inset-0 z-50 bg-white/60 flex justify-center items-center backdrop-blur-sm
              transition-opacity duration-300"
        [class.opacity-0]="!isLoading()"
        [class.opacity-100]="isLoading()"
        [class.pointer-events-none]="!isLoading()"
      >
        <app-loading [isLoading]="true" />
      </div>

      <!-- Tabela -->
      <div class="overflow-x-auto w-full flex-1 min-h-0">
        <table mat-table [dataSource]="data()" class="w-full min-w-full">
          <!-- Coluna ID -->
          <ng-container matColumnDef="id">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="hidden sm:table-cell !font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap"
            >
              ID
            </th>
            <td
              mat-cell
              *matCellDef="let item"
              class="hidden sm:table-cell !text-sm !px-3 whitespace-nowrap text-gray-600"
            >
              {{ item.id }}
            </td>
          </ng-container>

          <!-- Coluna Nome -->
          <ng-container matColumnDef="nome">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold text-gray-800 !text-sm !px-3 cursor-pointer select-none hover:bg-gray-100"
              (click)="toggleSort('nome')"
            >
              Nome do Titular/Procurador
              @if (sortColumn() === 'nome') {
                <mat-icon
                  class="ml-1 !text-[16px] !w-4 !h-4">{{ sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                </mat-icon>
              }
            </th>
            <td mat-cell *matCellDef="let item"
                class="!font-medium !text-sm !px-3 text-gray-800 truncate max-w-[200px] md:max-w-none">
              {{ item.nome }}
            </td>
          </ng-container>

          <!-- Coluna Tipo Certificado -->
          <ng-container matColumnDef="tipoCertificado">
            <th mat-header-cell *matHeaderCellDef
                class="!font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap text-center">
              Tipo
            </th>
            <td mat-cell *matCellDef="let item" class="!text-sm !px-3 whitespace-nowrap text-center">
              @if (item.tipoCertificado === 'A1') {
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
                  <mat-icon class="!text-[14px] !w-3.5 !h-3.5 mr-1 leading-none">description</mat-icon>
                  A1
                </span>
              } @else if (item.tipoCertificado === 'A3') {
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                  <mat-icon class="!text-[14px] !w-3.5 !h-3.5 mr-1 leading-none">token</mat-icon>
                  A3
                </span>
              } @else {
                <span class="text-xs text-gray-400 font-mono">-</span>
              }
            </td>
          </ng-container>

          <!-- Coluna Data Expedição -->
          <ng-container matColumnDef="dataExpedicao">
            <th mat-header-cell *matHeaderCellDef
                class="hidden md:table-cell !font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap">
              Emissão
            </th>
            <td mat-cell *matCellDef="let item"
                class="hidden md:table-cell !text-sm !px-3 whitespace-nowrap text-gray-600">
              {{ item.dataExpedicao ? (item.dataExpedicao | date:'dd/MM/yyyy') : '-' }}
            </td>
          </ng-container>

          <!-- Coluna Data Expiração -->
          <ng-container matColumnDef="dataExpiracao">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap cursor-pointer select-none hover:bg-gray-100"
              (click)="toggleSort('dataExpiracao')"
            >
              Validade
              @if (sortColumn() === 'dataExpiracao') {
                <mat-icon
                  class="ml-1 !text-[16px] !w-4 !h-4">{{ sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                </mat-icon>
              }
            </th>
            <td mat-cell *matCellDef="let item" class="!text-sm !px-3 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span class="text-gray-700 font-medium">
                  {{ item.dataExpiracao ? (item.dataExpiracao | date:'dd/MM/yyyy') : '-' }}
                </span>
                @if (item.dataExpiracao) {
                  <!-- @let is valid Angular 18+ syntax-->
                  @let status = getStatusExpiracao(item.dataExpiracao);
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border"
                    [ngClass]="status.cssClass"
                  >
                    <mat-icon class="!text-[12px] !w-3 !h-3 mr-0.5 leading-none">{{ status.icon }}</mat-icon>
                    {{ status.label }}
                  </span>
                }
              </div>
            </td>
          </ng-container>

          <!-- Coluna Ações -->
          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef class="!text-center !text-sm !px-3 !w-[1%] whitespace-nowrap">
              Ações
            </th>
            <td mat-cell *matCellDef="let item"
                class="!text-sm !px-2 md:!px-3 text-gray-600 whitespace-nowrap text-right">
              <div class="flex items-center justify-end gap-1 min-w-max">
                <button
                  mat-icon-button
                  matTooltip="Editar"
                  class="group !w-8 !h-8 !leading-none mr-1"
                  (click)="edit.emit(item)"
                >
                  <mat-icon
                    class="!text-blue-600 transition-transform duration-200 group-hover:!scale-125 !text-[20px]">
                    edit
                  </mat-icon>
                </button>
                <button
                  mat-icon-button
                  matTooltip="Excluir"
                  class="group !w-8 !h-8 !leading-none"
                  (click)="deleteItem.emit(item)"
                >
                  <mat-icon class="!text-red-600 transition-transform duration-200 group-hover:!scale-125 !text-[20px]">
                    delete
                  </mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <!-- Header & Rows -->
          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns(); sticky: true"
            class="!min-h-[40px] !h-[40px] !bg-gray-50 border-b-2 border-gray-300 !z-10"
          ></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns()"
            class="!min-h-[40px] !h-[40px] odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50 transition-colors border-gray-100"
          ></tr>

          <!-- No Data Row -->
          <tr class="mat-row" *matNoDataRow [class.hidden]="isLoading()">
            <td class="mat-cell border-none !p-0" [colSpan]="displayedColumns().length">
              <div class="flex flex-col items-center justify-center w-full h-[300px] text-gray-400 gap-3">
                <mat-icon class="scale-[2] !text-gray-300 mb-2">folder_off</mat-icon>
                <p class="text-base md:text-sm font-medium text-gray-500">
                  Nenhum procurador encontrado
                </p>
                <p class="text-xs text-gray-400">Tente ajustar os termos da sua pesquisa.</p>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Paginator -->
      <mat-paginator
        class="shrink-0 !bg-gray-50 border-t border-gray-200 relative !text-blue-700 z-20"
        [length]="totalElements()"
        [pageSize]="pageSize()"
        [pageIndex]="currentPage()"
        [pageSizeOptions]="[10, 30, 50]"
        [showFirstLastButtons]="true"
        (page)="pageChange.emit($event)"
        aria-label="Selecione a página"
      >
      </mat-paginator>
    </div>
  `
})
export class ProcuradorTableComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(map((res) => res.matches)),
    { initialValue: false }
  );

  displayedColumns = computed(() => {
    if (this.isMobile()) {
      return ['nome', 'tipoCertificado', 'dataExpiracao', 'acoes'];
    }
    return ['id', 'nome', 'tipoCertificado', 'dataExpedicao', 'dataExpiracao', 'acoes'];
  });

  // Sort state signals
  sortColumn = signal<'nome' | 'dataExpiracao' | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Inputs
  data = input.required<ProcuradorResponseDTO[]>();
  isLoading = input.required<boolean>();
  totalElements = input.required<number>();
  pageSize = input.required<number>();
  currentPage = input.required<number>();

  // Outputs
  edit = output<ProcuradorResponseDTO>();
  deleteItem = output<ProcuradorResponseDTO>();
  pageChange = output<PageEvent>();
  sortChange = output<{ active: string, direction: 'asc' | 'desc' }>();

  toggleSort(column: 'nome' | 'dataExpiracao'): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((d: 'asc' | 'desc') => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }

    this.sortChange.emit({
      active: this.sortColumn()!,
      direction: this.sortDirection()
    });
  }

  /**
   * Retorna a prioridade de ordenação baseada no status de expiração
   * 1 = Expirado (prioridade máxima)
   * 2 = Vencendo em até 30 dias
   * 3 = Válido (mais de 30 dias)
   * 99 = Data inválida/indisponível (vai para o final)
   */
  // private getExpiracaoPriority(dataIso: string | undefined): number {
  //   if (!dataIso) return 99;
  //   const exp = DateTime.fromISO(dataIso);
  //   if (!exp.isValid) return 99;
  //
  //   const now = DateTime.now();
  //   const diffDias = Math.floor(exp.diff(now, 'days').days);
  //
  //   if (diffDias < 0) return 1;      // Expirados
  //   if (diffDias <= 30) return 2;    // Vencendo em 30 dias
  //   return 3;                        // Válidos
  // }

  /**
   * Computed signal que retorna os dados ordenados.
   * - Se usuário clicou em header: ordenação interativa (nome ou dataExpiracao asc/desc)
   * - Se nenhuma interação: ordenação padrão por prioridade de expiração
   *   (Expirados → Vencendo 30d → Válidos), com dataExpiracao ASC dentro de cada grupo.
   */
  // sortedData = computed(() => {
  //   const items = [...this.data()];
  //   const col = this.sortColumn();
  //   const dir = this.sortDirection();
  //
  //   // Ordenação interativa (usuário clicou no header)
  //   if (col) {
  //     items.sort((a, b) => {
  //       let valA: any, valB: any;
  //       if (col === 'nome') {
  //         valA = a.nome?.toLowerCase() ?? '';
  //         valB = b.nome?.toLowerCase() ?? '';
  //       } else if (col === 'dataExpiracao') {
  //         valA = a.dataExpiracao ? DateTime.fromISO(a.dataExpiracao).toMillis() : 0;
  //         valB = b.dataExpiracao ? DateTime.fromISO(b.dataExpiracao).toMillis() : 0;
  //       }
  //       const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
  //       return dir === 'asc' ? cmp : -cmp;
  //     });
  //     return items;
  //   }
  //
  //   // Ordenação PADRÃO: por prioridade de expiração
  //   return items.sort((a, b) => {
  //     const priA = this.getExpiracaoPriority(a.dataExpiracao);
  //     const priB = this.getExpiracaoPriority(b.dataExpiracao);
  //     if (priA !== priB) return priA - priB;
  //
  //     // Mesmo grupo → data de expiração mais próxima primeiro (ASC)
  //     const expA = a.dataExpiracao ? DateTime.fromISO(a.dataExpiracao).toMillis() : Infinity;
  //     const expB = b.dataExpiracao ? DateTime.fromISO(b.dataExpiracao).toMillis() : Infinity;
  //     return expA - expB;
  //   });
  // });

  /**
   * Avalia a situação da data de expiração do certificado
   * Used in template via @let binding (Angular 18+)
   */
  // @ts-ignore - Used in template, IDE false positive
  getStatusExpiracao(dataIso: string): ExpiracaoStatus {
    const exp = DateTime.fromISO(dataIso);
    if (!exp.isValid) {
      return { label: 'Indefinido', cssClass: 'bg-gray-100 text-gray-600 border-gray-200', icon: 'help_outline' };
    }

    const now = DateTime.now();
    const diffDias = Math.floor(exp.diff(now, 'days').days);

    if (diffDias < 0) {
      return {
        label: 'Expirado',
        cssClass: '!font-bold bg-rose-100 text-rose-700 border-rose-200',
        icon: 'error_outline'
      };
    }

    if (diffDias <= 30) {
      return {
        label: diffDias === 0 ? 'Expira hoje' : `Expira em ${diffDias}d`,
        cssClass: '!font-bold bg-amber-100 text-amber-700 border-amber-200',
        icon: 'warning_amber'
      };
    }

    return {
      label: 'Válido',
      cssClass: '!font-bold bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: 'check_circle_outline'
    };
  }
}
