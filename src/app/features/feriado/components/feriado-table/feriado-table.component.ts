import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingComponent } from '../../../../shared/components/loading.component/loading.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FeriadoResponseDTO, TIPOS_FERIADO } from '../../models/feriado.model';

@Component({
  selector: 'app-feriado-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    LoadingComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col w-full border border-gray-300 rounded-lg overflow-hidden
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
          <!-- Coluna Data -->
          <ng-container matColumnDef="data">
            <th mat-header-cell *matHeaderCellDef
                class="!font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap text-center">
              Data (Dia/Mês)
            </th>
            <td mat-cell *matCellDef="let item"
                class="!text-sm !px-3 whitespace-nowrap text-center font-bold text-blue-900">
              {{ formatarData(item.data) }}
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
              Descrição / Nome
              @if (sortColumn() === 'nome') {
                <mat-icon class="ml-1 !text-[16px] !w-4 !h-4">
                  {{ sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                </mat-icon>
              }
            </th>
            <td mat-cell *matCellDef="let item"
                class="!font-medium !text-sm !px-3 text-gray-800 truncate max-w-[240px] md:max-w-none">
              {{ item.nome }}
            </td>
          </ng-container>
          <!-- Coluna Tipo -->
          <ng-container matColumnDef="tipo">
            <th mat-header-cell *matHeaderCellDef
                class="hidden sm:table-cell !font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap text-center">
              Tipo
            </th>
            <td mat-cell *matCellDef="let item"
                class="hidden sm:table-cell !text-sm !px-3 whitespace-nowrap text-center">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                [ngClass]="getTipoBadgeClass(item.tipo)"
              >
                {{ getTipoLabel(item.tipo) }}
              </span>
            </td>
          </ng-container>
          <!-- Coluna Checkbox / Ativo (Regra 3) -->
          <ng-container matColumnDef="ativo">
            <th mat-header-cell *matHeaderCellDef
                class="!font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap text-center">
              Folha de Ponto
            </th>
            <td mat-cell *matCellDef="let item" class="!text-sm !px-3 whitespace-nowrap text-center">
              <mat-slide-toggle
                color="primary"
                [checked]="item.ativo"
                [matTooltip]="item.ativo ? 'Considerado na folha (clique para desativar)' : 'Ignorado na folha (clique para ativar)'"
                (change)="toggleAtivo.emit({ item, novoStatus: $event.checked })"
              />
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
          <tr mat-header-row *matHeaderRowDef="displayedColumns(); sticky: true"
              class="!min-h-[40px] !h-[40px] !bg-gray-50 border-b-2 border-gray-300 !z-10"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns()"
            class="!min-h-[40px] !h-[40px] odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50 transition-colors border-gray-100"
          ></tr>
          <!-- Sem Registros -->
          <tr class="mat-row" *matNoDataRow [class.hidden]="isLoading()">
            <td class="mat-cell border-none !p-0" [colSpan]="displayedColumns().length">
              <div class="flex flex-col items-center justify-center w-full h-[300px] text-gray-400 gap-3">
                <mat-icon class="scale-[2] !text-gray-300 mb-2">event_busy</mat-icon>
                <p class="text-base md:text-sm font-medium text-gray-500">Nenhum feriado encontrado</p>
                <p class="text-xs text-gray-400">Tente ajustar a sua pesquisa.</p>
              </div>
            </td>
          </tr>
        </table>
      </div>
      <!-- Paginador -->
      <mat-paginator
        class="shrink-0 !bg-gray-50 border-t border-gray-200 relative !text-blue-700 z-20"
        [length]="totalElements()"
        [pageSize]="pageSize()"
        [pageIndex]="currentPage()"
        [pageSizeOptions]="[10, 15, 20]"
        [showFirstLastButtons]="true"
        (page)="pageChange.emit($event)"
      />
    </div>
  `,
  styles: ``
})
export class FeriadoTableComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(map((res) => res.matches)),
    { initialValue: false }
  );

  displayedColumns = computed(() => {
    if (this.isMobile()) {
      return ['data', 'nome', 'ativo', 'acoes'];
    }
    return ['data', 'nome', 'tipo', 'ativo', 'acoes'];
  });

  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  data = input.required<FeriadoResponseDTO[]>();
  isLoading = input.required<boolean>();
  totalElements = input.required<number>();
  pageSize = input.required<number>();
  currentPage = input.required<number>();

  edit = output<FeriadoResponseDTO>();
  deleteItem = output<FeriadoResponseDTO>();
  toggleAtivo = output<{ item: FeriadoResponseDTO; novoStatus: boolean }>();
  pageChange = output<PageEvent>();
  sortChange = output<{ active: string; direction: 'asc' | 'desc' }>();

  formatarData(data: string): string {
    if (!data) return '-';

    if (data.includes('-')) {
      const [mes, dia] = data.split('-');
      return `${dia}/${mes}`;
    }
    return data;
  }

  getTipoLabel(tipo: string): string {
    const opt = TIPOS_FERIADO.find(t => t.value === tipo);
    return opt ? opt.label : tipo;
  }

  getTipoBadgeClass(tipo: string): string {
    const opt = TIPOS_FERIADO.find(t => t.value === tipo);
    return opt ? opt.badgeClass : 'bg-gray-100 text-gray-800';
  }

  toggleSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }

    this.sortChange.emit({
      active: this.sortColumn()!,
      direction: this.sortDirection()
    });
  }
}
