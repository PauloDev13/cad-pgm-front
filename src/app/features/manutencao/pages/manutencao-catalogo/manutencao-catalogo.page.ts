import { ChangeDetectionStrategy, Component, effect, inject, Injector, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoriaDemandaResponseDTO, TipoServicoResponseDTO } from '../../models/manutencao-catalogo.model';
import {
  TipoServicoDialogData,
  TipoServicoFormDialogComponent
} from '../../components/tipo-servico-form-dialog/tipo-servico-form-dialog.component';
import { CategoriaFormDialogComponent } from '../../components/categoria-form-dialog/categoria-form-dialog.component';
import { ManutencaoStore } from '../../state/manutencao.store';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-manutencao-catalogo',
  standalone: true,
  providers: [ManutencaoStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatPaginatorModule
  ],
  template: `
    <div class="bg-gray-50 rounded-2xl p-4 md:p-6 mx-auto max-w-7xl w-full">
      <!-- Cabeçalho -->
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-blue-800 leading-tight">
            Catálogo de Serviços de Manutenção
          </h1>
          <p class="text-sm text-gray-500 mt-1">Gerencie as categorias e os tipos de serviços disponíveis</p>
        </div>
          <!-- Botão Nova Categoria -->
          <button
            mat-flat-button
            [hidden]="store.catalogoTabAtiva() === 1"
            class="!rounded-3xl !bg-blue-600 !text-white hover:scale-105 transition-transform"
            (click)="abrirModalCategoria()">
            <mat-icon class="!mr-1">add</mat-icon>
            Nova Categoria
          </button>

          <!-- Botão Novo Tipo de Serviço -->
          <button
            mat-flat-button
            [hidden]="store.catalogoTabAtiva() === 0"
            class="!rounded-3xl !bg-blue-600 !text-white hover:scale-105 transition-transform"
            [disabled]="!categoriaSelecionadaId()"
            (click)="abrirModalTipoServico()">
            <mat-icon class="!mr-1">add</mat-icon>
            Novo Tipo de Serviço
          </button>
      </div>

      <mat-tab-group
        [selectedIndex]="store.catalogoTabAtiva()"
        (selectedIndexChange)="store.setCatalogoTab($event)"
        animationDuration="200ms"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <!-- ========================================== -->
        <!-- ABA 1: CATEGORIAS DE DEMANDA               -->
        <!-- ========================================== -->
        <mat-tab label="Categorias de Demanda">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <div>
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lista de Categorias</span>
                <p class="text-xs text-gray-400 m-0">Categorias agrupadoras dos serviços de manutenção predial</p>
              </div>
            </div>

            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table mat-table [dataSource]="store.categoriasPaginadas()" class="w-full">
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef class="!w-16 !font-semibold text-gray-700">ID</th>
                  <td mat-cell *matCellDef="let cat" class="font-mono text-gray-600">{{ cat.id }}</td>
                </ng-container>

                <ng-container matColumnDef="nome">
                  <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Nome</th>
                  <td mat-cell *matCellDef="let cat" class="font-semibold text-gray-800">{{ cat.nome }}</td>
                </ng-container>

                <ng-container matColumnDef="descricao">
                  <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Descrição</th>
                  <td mat-cell *matCellDef="let cat" class="text-gray-600">{{ cat.descricao || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="ordem">
                  <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700 text-center !w-24">
                    Ordem
                  </th>
                  <td mat-cell *matCellDef="let cat" class="text-center font-mono">{{ cat.ordemExibicao ?? 0 }}</td>
                </ng-container>

                <ng-container matColumnDef="ativo">
                  <th mat-header-cell *matHeaderCellDef class="text-center !font-semibold text-gray-700 !w-24">
                    Status
                  </th>
                  <td mat-cell *matCellDef="let cat" class="text-center">
                    <span
                      [class]="cat.ativo ?
                      'text-emerald-700 bg-emerald-100 border-emerald-300' :
                      'text-gray-600 bg-gray-100 border-gray-300'"
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-block">
                      {{ cat.ativo ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acoes">
                  <th mat-header-cell *matHeaderCellDef class="text-right !font-semibold text-gray-700 !w-24">Ações</th>
                  <td mat-cell *matCellDef="let cat" class="text-right">
                    <button
                      mat-icon-button
                      color="primary"
                      matTooltip="Editar Categoria"
                      (click)="abrirModalCategoria(cat)">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['id', 'nome', 'descricao', 'ordem', 'ativo', 'acoes']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['id', 'nome', 'descricao', 'ordem', 'ativo', 'acoes']"
                    class="hover:bg-blue-50/40"></tr>
              </table>
              @if(!store.isLoading() && store.categoriasPaginadas().length === 0) {
                <div class="p-6 text-center text-gray-500 text-sm">
                  Nenhuma categoria encontrada.
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- ========================================== -->
        <!-- ABA 2: TIPOS DE SERVIÇO                    -->
        <!-- ========================================== -->
        <mat-tab label="Tipos de Serviço">
          <div class="p-4">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
              <!-- Filtro de Categoria -->
              <div class="w-full sm:w-72">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <mat-label>Filtrar por Categoria</mat-label>
                  <mat-select
                    [value]="store.catalogoCategoriaSelecionadaId()"
                    (selectionChange)="store.setCatalogoCategoriaSelecionada($event.value)">
                    @for (cat of store.categorias(); track cat.id) {
                      <mat-option [value]="cat.id">{{ cat.nome }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>
            </div>

            <!-- Tabela iterando sobre os tipos da Store -->
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table mat-table [dataSource]="store.tiposPorCategoriaPaginados()" class="w-full">
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef class="!w-16 !font-semibold text-gray-700">ID</th>
                  <td mat-cell *matCellDef="let tipo" class="font-mono text-gray-600">{{ tipo.id }}</td>
                </ng-container>

<!--                <ng-container matColumnDef="categoria">-->
<!--                  <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Categoria</th>-->
<!--                  <td mat-cell *matCellDef="let tipo" class="font-medium text-blue-800">{{ tipo.categoriaNome }}</td>-->
<!--                </ng-container>-->

                <ng-container matColumnDef="nome">
                  <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Serviço</th>
                  <td mat-cell *matCellDef="let tipo" class="font-semibold text-gray-800">{{ tipo.nome }}</td>
                </ng-container>

                <ng-container matColumnDef="descricao">
                  <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Descrição</th>
                  <td mat-cell *matCellDef="let tipo" class="text-gray-600">{{ tipo.descricao || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef class="text-center !font-semibold text-gray-700 !w-24">Ativo
                  </th>
                  <td mat-cell *matCellDef="let tipo" class="text-center">
                    <mat-slide-toggle
                      [checked]="tipo.ativo"
                      (change)="toggleStatusTipo(tipo, $event.checked)">
                    </mat-slide-toggle>
                  </td>
                </ng-container>

                <ng-container matColumnDef="acoes">
                  <th mat-header-cell *matHeaderCellDef class="text-right !font-semibold text-gray-700 !w-24">Ações</th>
                  <td mat-cell *matCellDef="let tipo" class="text-right">
                    <button
                      mat-icon-button
                      color="primary"
                      matTooltip="Editar Serviço"
                      (click)="abrirModalTipoServico(tipo)">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['id', 'nome', 'descricao', 'status', 'acoes']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['id', 'nome', 'descricao', 'status', 'acoes']"
                    class="hover:bg-blue-50/40"></tr>
              </table>

              @if (!store.isLoading() && store.tiposPorCategoriaPaginados().length === 0) {
                <div class="p-6 text-center text-gray-500 text-sm">
                  Nenhum tipo de serviço encontrado para a categoria selecionada.
                </div>
              }
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
      <!-- ======================================================== -->
      <!-- PAGINATOR ÚNICO INTEGRADO DIRETAMENTE À STORE            -->
      <!-- ======================================================== -->
      <mat-paginator
        [length]="store.catalogoTotalElements()"
        [pageSize]="store.catalogoPageSize()"
        [pageIndex]="store.catalogoPageIndex()"
        [pageSizeOptions]="[5, 10, 20]"
        (page)="store.changeCatalogoPagination($event.pageIndex, $event.pageSize)"
        showFirstLastButtons
        class="border-t border-gray-200"
        aria-label="Controle de paginação do catálogo">
      </mat-paginator>
    </div>
  `
})
export default class ManutencaoCatalogoPage implements OnInit {
  protected readonly store = inject(ManutencaoStore);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);

  readonly categoriaSelecionadaId = signal<number | null>(null);

  constructor() {
    effect(() => {
      const cats = this.store.categorias();

      if (cats.length > 0 && !this.categoriaSelecionadaId()) {
        const primeiroId = cats[0].id;
        this.categoriaSelecionadaId.set(primeiroId);
        this.store.loadTiposAtivosPorCategoria(primeiroId);
      }
    });
  }

  ngOnInit() {
    this.store.initCatalogo();
  }

  abrirModalCategoria(categoria?: CategoriaDemandaResponseDTO) {
    const dialogRef = this.dialog.open(CategoriaFormDialogComponent, {
      width: '540px',
      maxWidth: '95vw',
      disableClose: true,
      data: categoria ?? null,
      injector: this.injector
    });

    dialogRef.afterClosed().subscribe((atualizou) => {
      if (atualizou) {
        this.store.loadCategoriasAtivas();
      }
    });
  }

  abrirModalTipoServico(tipo?: TipoServicoResponseDTO) {
    const data: TipoServicoDialogData = {
      tipoServico: tipo,
      categoriaIdSelecionada: this.categoriaSelecionadaId() ?? undefined
    };

    const dialogRef = this.dialog.open(TipoServicoFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data,
      injector: this.injector
    });

    dialogRef.afterClosed().subscribe((atualizou) => {
      if (atualizou && this.categoriaSelecionadaId()) {
        this.store.loadTiposAtivosPorCategoria(this.categoriaSelecionadaId()!);
      }
    });
  }

  toggleStatusTipo(tipo: TipoServicoResponseDTO, novoStatus: boolean) {
    this.store.alterarStatusTipoServico({
      id: tipo.id,
      categoriaId: tipo.categoriaId,
      ativo: novoStatus
    });
  }
}
