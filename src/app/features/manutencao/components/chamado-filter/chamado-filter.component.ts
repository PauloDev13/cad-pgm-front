import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ManutencaoStore } from '../../state/manutencao.store';
import { AndarCodigo, EstadoChamado, ESTADO_CHAMADO_LABELS } from '../../models/manutencao-enums.model';

@Component({
  selector: 'app-chamado-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="bg-white md:bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-200 mb-6 shadow-sm">
      <div class="flex items-center justify-between pb-4">
        <div class="flex items-center gap-2 mb-3 text-blue-800 font-semibold text-sm">
          <mat-icon class="!scale-90">filter_list</mat-icon>
          Filtros de Pesquisa
        </div>
        <!-- Botão Limpar -->
        <button
          mat-stroked-button
          (click)="limparFiltros()"
          class="!border-blue-600 !text-blue-600 !rounded-3xl hover:!bg-blue-50 transition-colors">
          <mat-icon>delete_sweep</mat-icon>
          Limpar Filtros
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Estado -->
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Status</mat-label>
          <mat-select
            [value]="store.filtroEstado()"
            (selectionChange)="onEstadoChange($event.value)">
            <mat-option [value]="null">Todos os status</mat-option>
            @for (estado of estadosDisponiveis; track estado) {
              <mat-option [value]="estado">{{ getEstadoLabel(estado) }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Andar -->
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Andar</mat-label>
          <mat-select
            [value]="store.filtroAndar()"
            (selectionChange)="onAndarChange($event.value)">
            <mat-option [value]="null">Todos os andares</mat-option>
            @for (andar of store.andares(); track andar.codigo) {
              <mat-option [value]="andar.codigo">{{ andar.rotulo }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Sala -->
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Sala</mat-label>
          <mat-select
            [value]="store.filtroSalaId()"
            [disabled]="!store.filtroAndar()"
            (selectionChange)="onSalaChange($event.value)">
            <mat-option [value]="null">Todas as salas</mat-option>
            @for (sala of store.salasPorAndar(); track sala.id) {
              <mat-option [value]="sala.id">{{ sala.numeroIdentificacao }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Categoria -->
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Categoria</mat-label>
          <mat-select
            [value]="store.filtroCategoriaId()"
            (selectionChange)="onCategoriaChange($event.value)">
            <mat-option [value]="null">Todas as categorias</mat-option>
            @for (cat of store.categorias(); track cat.id) {
              <mat-option [value]="cat.id">{{ cat.nome }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Tipo de Serviço -->
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
          <mat-label>Tipo de Serviço</mat-label>
          <mat-select
            [value]="store.filtroTipoServicoId()"
            [disabled]="!store.filtroCategoriaId()"
            (selectionChange)="onTipoServicoChange($event.value)">
            <mat-option [value]="null">Todos os tipos</mat-option>
            @for (tipo of store.tiposPorCategoria(); track tipo.id) {
              <mat-option [value]="tipo.id">{{ tipo.nome }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </div>
  `
})
export class ChamadoFilterComponent {
  protected readonly store = inject(ManutencaoStore);

  readonly estadosDisponiveis = Object.values(EstadoChamado);

  constructor() {
    this.store.loadAndares();
    this.store.loadCategoriasAtivas();
  }

  getEstadoLabel(estado: EstadoChamado): string {
    return ESTADO_CHAMADO_LABELS[estado] || estado;
  }

  onEstadoChange(estado: EstadoChamado | null) {
    this.store.updateFiltros({ filtroEstado: estado });
    this.store.reloadList();
  }

  onAndarChange(andar: AndarCodigo | null) {
    this.store.updateFiltros({ filtroAndar: andar, filtroSalaId: null });
    if (andar) {
      this.store.loadSalasPorAndar(andar);
    }
    this.store.reloadList();
  }

  onSalaChange(salaId: number | null) {
    this.store.updateFiltros({ filtroSalaId: salaId });
    this.store.reloadList();
  }

  onCategoriaChange(categoriaId: number | null) {
    this.store.updateFiltros({ filtroCategoriaId: categoriaId, filtroTipoServicoId: null });
    if (categoriaId) {
      this.store.loadTiposAtivosPorCategoria(categoriaId);
    }
    this.store.reloadList();
  }

  onTipoServicoChange(tipoServicoId: number | null) {
    this.store.updateFiltros({ filtroTipoServicoId: tipoServicoId });
    this.store.reloadList();
  }

  limparFiltros() {
    this.store.clearFiltros();
    this.store.reloadList();
  }
}
