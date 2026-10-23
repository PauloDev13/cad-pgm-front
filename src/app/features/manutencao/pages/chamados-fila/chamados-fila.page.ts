import { ChangeDetectionStrategy, Component, effect, inject, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ChamadoFilterComponent } from '../../components/chamado-filter/chamado-filter.component';
import { ChamadoTableComponent } from '../../components/chamado-table/chamado-table.component';
import { ManutencaoStore } from '../../state/manutencao.store';
import { ChamadoDetalheDialogComponent } from '../../components/chamado-detalhe/chamado-detalhe-dialog.component';
import { ChamadoFormComponent } from '../../components/chamado-form/chamado-form.component';

@Component({
  selector: 'app-chamados-fila',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ChamadoFilterComponent,
    ChamadoTableComponent,
    ChamadoFilterComponent,
    ChamadoTableComponent,
  ],
  providers: [ManutencaoStore],
  template: `
    <div class="bg-gray-50 rounded-2xl p-4 md:p-6 mx-auto max-w-7xl w-full">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-blue-800 leading-tight">
            Fila Geral de Manutenção
          </h1>
          <p class="text-sm text-gray-500 mt-1">Gestão operacional de chamados prediais da PGM</p>
        </div>

        <button
          mat-flat-button
          class="!rounded-3xl !bg-blue-600 !text-white w-full sm:w-auto hover:!scale-105 transition-transform flex items-center justify-center !h-10"
          (click)="abrirNovoChamado()"
        >
          <mat-icon class="!mr-1">add</mat-icon>
          Abrir Chamado
        </button>
      </div>

      <!-- Filtros Dinâmicos -->
      <app-chamado-filter />

      <!-- Tabela com Resultados -->
      <app-chamado-table
        [data]="store.chamados()"
        [isLoading]="store.isLoading()"
        [totalElements]="store.totalElements()"
        [pageSize]="store.pageSize()"
        [currentPage]="store.currentPage()"
        (detalhes)="verDetalhes($event)"
        (pageChange)="onPageChange($event)"
      />
    </div>
  `,
})
export default class ChamadosFilaPage implements OnInit {
  protected readonly store = inject(ManutencaoStore);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      const params = this.store.queryParams();
      this.store.loadFilaGeral(params);
    });
  }

  ngOnInit() {
    this.store.reloadList();
  }

  onPageChange(event: PageEvent) {
    this.store.updatePagination(event.pageIndex, event.pageSize);
    this.store.reloadList();
  }

  abrirNovoChamado() {
    const dialogRef = this.dialog.open(ChamadoFormComponent, {
      width: '720px',
      maxWidth: '95vw',
      disableClose: true,
      injector: this.injector,
    });

    dialogRef.afterClosed().subscribe((sucesso) => {
      if (sucesso) {
        this.store.reloadList();
      }
    });
  }

  verDetalhes(chamadoId: number) {
    const dialogRef = this.dialog.open(ChamadoDetalheDialogComponent, {
      width: '850px',
      maxWidth: '95vw',
      data: chamadoId,
      injector: this.injector,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.store.reloadList();
    });
  }
}
