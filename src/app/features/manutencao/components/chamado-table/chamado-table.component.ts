import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../../../shared/components/loading.component/loading.component';
import { ChamadoResumoResponseDTO } from '../../models/manutencao-chamado.model';
import { EstadoChamado } from '../../models/manutencao-enums.model';

@Component({
  selector: 'app-chamado-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    LoadingComponent
  ],
  template: `
    <div class="flex flex-col w-full border border-gray-300 rounded-lg overflow-hidden relative min-h-[350px]">
      <div
        class="absolute inset-0 z-50 bg-white/60 flex justify-center items-center backdrop-blur-sm transition-opacity duration-300"
        [class.opacity-0]="!isLoading()"
        [class.opacity-100]="isLoading()"
        [class.pointer-events-none]="!isLoading()">
        <app-loading [isLoading]="true" />
      </div>

      <div class="overflow-x-auto w-full flex-1">
        <table mat-table [dataSource]="data()" class="w-full">
          <!-- Protocolo -->
          <ng-container matColumnDef="protocolo">
            <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-800 !text-sm !px-3">Protocolo</th>
            <td mat-cell *matCellDef="let c" class="!text-sm !px-3 font-mono font-semibold text-blue-700">
              {{ c.protocolo }}
            </td>
          </ng-container>

          <!-- Local -->
          <ng-container matColumnDef="local">
            <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-800 !text-sm !px-3">Localização</th>
            <td mat-cell *matCellDef="let c" class="!text-sm !px-3">
              <span class="font-medium text-gray-800">{{ c.rotuloAndar }}</span>
              <span class="text-xs text-gray-500 block">{{ c.localExibicao }}</span>
            </td>
          </ng-container>

          <!-- Serviço -->
          <ng-container matColumnDef="servico">
            <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-800 !text-sm !px-3">Demanda</th>
            <td mat-cell *matCellDef="let c" class="!text-sm !px-3">
              <span class="font-medium text-gray-800">{{ c.tipoServicoNome }}</span>
              <span class="text-xs text-gray-500 block">{{ c.categoriaNome }}</span>
            </td>
          </ng-container>

          <!-- Solicitante -->
          <ng-container matColumnDef="solicitante">
            <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-800 !text-sm !px-3">Solicitante</th>
            <td mat-cell *matCellDef="let c" class="!text-sm !px-3 text-gray-700">{{ c.solicitanteNome }}</td>
          </ng-container>

          <!-- Responsável -->
          <ng-container matColumnDef="responsavel">
            <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-800 !text-sm !px-3">Responsável</th>
            <td mat-cell *matCellDef="let c" class="!text-sm !px-3 text-gray-600">
              {{ c.responsavelNome || 'Não atribuído' }}
            </td>
          </ng-container>

          <!-- Estado / Status Badge -->
          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-800 !text-sm !px-3 text-center">Status</th>
            <td mat-cell *matCellDef="let c" class="!text-sm !px-3 text-center">
              <span [ngClass]="getStatusBadgeClass(c.estado)" class="px-2.5 py-1 rounded-full text-xs font-semibold inline-block">
                {{ c.rotuloEstado }}
              </span>
            </td>
          </ng-container>

          <!-- Data de Criação -->
          <ng-container matColumnDef="criadoEm">
            <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-800 !text-sm !px-3">Aberto em</th>
            <td mat-cell *matCellDef="let c" class="!text-sm !px-3 text-gray-600">
              {{ c.criadoEm | date:'dd/MM/yyyy HH:mm' }}
            </td>
          </ng-container>

          <!-- Ações -->
          <ng-container matColumnDef="acoes">
            <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-800 !text-sm !px-3 text-right">Ações</th>
            <td mat-cell *matCellDef="let c" class="!text-sm !px-3 text-right">
              <button
                mat-icon-button
                color="primary"
                matTooltip="Ver Detalhes"
                (click)="detalhes.emit(c.id)">
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row *matRowDef="let row;
             columns: displayedColumns;"
            class="hover:bg-blue-50/50 cursor-pointer transition-colors">
          </tr>
        </table>
      </div>

      <mat-paginator
        [length]="totalElements()"
        [pageSize]="pageSize()"
        [pageIndex]="currentPage()"
        [pageSizeOptions]="[5, 10, 25]"
        (page)="pageChange.emit($event)"
        class="border-t border-gray-200">
      </mat-paginator>
    </div>
  `
})
export class ChamadoTableComponent {
  readonly data = input.required<ChamadoResumoResponseDTO[]>();
  readonly isLoading = input.required<boolean>();
  readonly totalElements = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly currentPage = input.required<number>();

  readonly detalhes = output<number>();
  readonly pageChange = output<PageEvent>();

  readonly displayedColumns = [
    'protocolo',
    'local',
    'servico',
    'solicitante',
    'responsavel',
    'estado',
    'criadoEm',
    'acoes'
  ];

  getStatusBadgeClass(estado: EstadoChamado): string {
    switch (estado) {
      case EstadoChamado.ABERTO:
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case EstadoChamado.ATRIBUIDO:
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case EstadoChamado.EM_ATENDIMENTO:
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      case EstadoChamado.CONCLUIDO:
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case EstadoChamado.CANCELADO:
        return 'bg-rose-100 text-rose-800 border border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
