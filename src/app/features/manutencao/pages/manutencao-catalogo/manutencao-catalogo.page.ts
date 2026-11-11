import { ChangeDetectionStrategy, Component, computed, inject, Injector, OnInit, signal } from '@angular/core';
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
import {
  CategoriaDemandaResponseDTO,
  SubcategoriaDialogData,
  SubcategoriaResponseDTO,
  TipoServicoDialogData,
  TipoServicoResponseDTO
} from '../../models/manutencao-catalogo.model';
import {
  TipoServicoFormDialogComponent
} from '../../components/tipo-servico-form-dialog/tipo-servico-form-dialog.component';
import { CategoriaFormDialogComponent } from '../../components/categoria-form-dialog/categoria-form-dialog.component';
import { ManutencaoStore } from '../../state/manutencao.store';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  SubcategoriaFormDialogComponent
} from '../../components/subcategoria-form-dialog/subcategoria-form-dialog.component';

@Component({
  selector: 'app-manutencao-catalogo',
  standalone: true,
  providers: [ManutencaoStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Fixação de dimensões no elemento host
  host: {
    class: 'flex flex-col flex-1 min-h-0 h-full w-full'
  },
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
    <!--   Atribui as variáveis 'nomeSubcategoria' e 'nomeCategoria' os valores retornados pelos 'computeds'
    nomeSubcategoriaSelecionada nomeCategoriaSelecionada respectivamente -->
    @let nomeSubcategoria = nomeSubcategoriaSelecionada();
    @let nomeCategoria = nomeCategoriaSelecionada();

    <div class="bg-gray-50 rounded-2xl p-4 md:p-6 mx-auto max-w-7xl w-full h-full flex flex-col min-h-0">
      <!-- Cabeçalho -->
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 shrink-0">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-blue-800 leading-tight">
            Catálogo de Serviços de Manutenção
          </h1>
          <p class="text-sm text-gray-500 mt-1">Gerencie as categorias e os tipos de serviços disponíveis</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <!-- Botão Nova Categoria -->
          <button
            mat-flat-button
            [hidden]="store.catalogoTabAtiva() === 1 || store.catalogoTabAtiva() === 2"
            class="!rounded-3xl !bg-blue-600 !text-white hover:scale-105 transition-transform"
            (click)="abrirModalCategoria()">
            <mat-icon class="!mr-1">add</mat-icon>
            Novo Grupo
          </button>
          <!-- Botão Nova Subcategoria -->
          <button
            mat-flat-button
            [hidden]="store.catalogoTabAtiva() === 0 || store.catalogoTabAtiva() === 2"
            class="!rounded-3xl !bg-blue-600 !text-white hover:scale-105 transition-transform"
            (click)="abrirModalSubcategoria()">
            <mat-icon class="!mr-1">add</mat-icon>
            Nova Categoria
          </button>

          <!-- Botão Novo Tipo de Serviço -->
          <button
            mat-flat-button
            [hidden]="store.catalogoTabAtiva() === 0 || store.catalogoTabAtiva() === 1"
            class="!rounded-3xl !bg-blue-600 !text-white hover:scale-105 transition-transform"
            (click)="abrirModalTipoServico()">
            <mat-icon class="!mr-1">add</mat-icon>
            Nova Subcategoria
          </button>
        </div>
      </div>

      <mat-tab-group
        [selectedIndex]="store.catalogoTabAtiva()"
        (selectedIndexChange)="store.setCatalogoTab($event)"
        animationDuration="200ms"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex-1 flex flex-col min-h-0">
        <!-- ========================================== -->
        <!-- ABA 1: GRUPO DE DEMANDA               -->
        <!-- ========================================== -->
        <mat-tab label="GRUPO DE DEMANDA">
          <div class="p-4 flex flex-col flex-1 min-h-0 h-full">
            <div class="flex justify-between items-center mb-3 shrink-0">
              <div>
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lista de Grupos</span>
                <p class="text-xs text-gray-400 m-0">Grupos dos serviços de manutenção predial</p>
              </div>
            </div>
            <!-- Tabela de Categorias -->
            <div class="border border-gray-200 rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
              <div class="overflow-y-auto overflow-x-auto flex-1 min-h-0 custom-scrollbar">
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
                      <mat-slide-toggle
                        [checked]="cat.ativo"
                        (change)="toggleStatusCategoria(cat, $event.checked)">
                      </mat-slide-toggle>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="acoes">
                    <th mat-header-cell *matHeaderCellDef class="text-right !font-semibold text-gray-700 !w-24">Ações
                    </th>
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
                @if (!store.isLoading() && store.categoriasPaginadas().length === 0) {
                  <div class="p-6 text-center text-gray-500 text-sm">
                    Nenhum Grupo encontrado.
                  </div>
                }
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- ======================================================== -->
        <!--  ABA 2: CATEGORIAS (FILTRO + RESET + TABELA)   -->
        <!-- ======================================================== -->
        <mat-tab label="CATEGORIAS">
          <div class="p-4 flex flex-col flex-1 min-h-0 h-full">
            <!-- Filtro de Categoria Pai -->
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-3 shrink-0">
              <div class="flex items-center gap-2 w-full sm:w-1/2">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <mat-select
                    [value]="store.filtroSubcategoriaCategoriaId()"
                    (selectionChange)="store.onCategoriaFilterChange($event.value)"
                    placeholder="Selecione uma Categoria"
                  >
                    <mat-option [value]="null">Selecione uma Categoria</mat-option>
                    @for (cat of store.categoriasAtivasDropdown(); track cat.id) {
                      <mat-option
                        [class]="cat.ativo
                        ? '!font-semibold !text-blue-700'
                        : '!font-semibold !text-red-700'"
                        [value]="cat.id"
                        [hidden]="!cat.ativo"
                      >
                        {{ cat.ativo ? cat.nome : cat.nome + ' (Inativa)' }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <!-- Botão Reset / Limpar Filtro -->
                <button
                  mat-icon-button
                  type="button"
                  color="warn"
                  matTooltip="Limpar filtro de categoria"
                  aria-label="Limpar filtro de categoria"
                  [disabled]="store.filtroSubcategoriaCategoriaId() === null"
                  (click)="store.resetFiltroSubcategoria()"
                  class="!rounded-full hover:bg-red-50 transition-colors">
                  <mat-icon class="!text-red-700">filter_alt_off</mat-icon>
                </button>
              </div>

              <div
                [hidden]="store.filtroSubcategoriaCategoriaId() !== null"
                class="text-xs text-gray-500">
                Exibindo todas as Categorias
              </div>
              <div
                [hidden]="store.filtroSubcategoriaCategoriaId() === null"
                class="text-xs text-gray-500">
                Categorias para o Grupo
                <span class="text-blue-800 font-bold"> {{ nomeCategoria?.nome?.toUpperCase() }}</span>
              </div>
            </div>
            <!-- Tabela de Categorias -->
            <div class="border border-gray-200 rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
              <div class="overflow-y-auto overflow-x-auto flex-1 min-h-0 custom-scrollbar">
                <table mat-table [dataSource]="store.subcategoriasPaginadas()" class="w-full">
                  <!-- ID -->
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef class="!w-16 !font-semibold text-gray-700">ID</th>
                    <td mat-cell *matCellDef="let sub" class="font-mono text-gray-600">{{ sub.id }}</td>
                  </ng-container>
                  <!-- Nome -->
                  <ng-container matColumnDef="nome">
                    <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Categoria</th>
                    <td mat-cell *matCellDef="let sub" class="font-semibold text-gray-800">{{ sub.nome }}</td>
                  </ng-container>
                  <!-- Descrição -->
                  <ng-container matColumnDef="descricao">
                    <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Grupo de Demanda</th>
                    <td mat-cell *matCellDef="let sub"
                        class="font-medium text-blue-800">{{ sub.categoriaNome || '-' }}
                    </td>
                  </ng-container>
                  <!-- Exige Tombamento -->
                  <ng-container matColumnDef="requerTombamento">
                    <th mat-header-cell *matHeaderCellDef class="text-center !font-semibold text-gray-700 !w-32">
                      Tombamento
                    </th>
                    <td mat-cell *matCellDef="let sub" class="text-center">
                      <span
                        [class]="sub.requerTombamento ?
                        'text-purple-700 bg-purple-100 border-purple-300' :
                        'text-gray-500 bg-gray-50 border-gray-200'"
                        class="px-2.5 py-0.5 rounded-full text-xs font-medium border inline-block">
                        {{ sub.requerTombamento ? 'Exige Tombo' : 'Não exige' }}
                      </span>
                    </td>
                  </ng-container>
                  <!-- Prazo Estimado -->
                  <ng-container matColumnDef="prazoEstimado">
                    <th mat-header-cell *matHeaderCellDef class="text-center !font-semibold text-gray-700 !w-28">Prazo
                    </th>
                    <td mat-cell *matCellDef="let sub" class="text-center text-gray-700 text-xs">
                      {{ sub.prazoEstimadoDias ? (sub.prazoEstimadoDias + ' dias') : '-' }}
                    </td>
                  </ng-container>
                  <!-- Ordem -->
                  <ng-container matColumnDef="ordem">
                    <th mat-header-cell *matHeaderCellDef class="text-center !font-semibold text-gray-700 !w-20">Ordem
                    </th>
                    <td mat-cell *matCellDef="let sub" class="text-center font-mono">{{ sub.ordemExibicao ?? 0 }}</td>
                  </ng-container>
                  <!-- Status (Slide Toggle) -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef class="text-center !font-semibold text-gray-700 !w-24">Ativo
                    </th>
                    <td mat-cell *matCellDef="let sub" class="text-center">
                      <mat-slide-toggle
                        [checked]="sub.ativo"
                        (change)="toggleStatusSubcategoria(sub, $event.checked)">
                      </mat-slide-toggle>
                    </td>
                  </ng-container>
                  <!-- Ações -->
                  <ng-container matColumnDef="acoes">
                    <th mat-header-cell *matHeaderCellDef class="text-right !font-semibold text-gray-700 !w-24">Ações
                    </th>
                    <td mat-cell *matCellDef="let sub" class="text-right">
                      <button
                        mat-icon-button
                        color="primary"
                        matTooltip="Editar Subcategoria"
                        (click)="abrirModalSubcategoria(sub)">
                        <mat-icon>edit</mat-icon>
                      </button>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="[
                        'id', 'nome', 'descricao', 'requerTombamento', 'prazoEstimado', 'ordem', 'status', 'acoes']"></tr>
                  <tr mat-row *matRowDef="let row; columns: [
                        'id', 'nome', 'descricao', 'requerTombamento', 'prazoEstimado', 'ordem', 'status', 'acoes']"
                      class="hover:bg-blue-50/40"></tr>
                  <!--                  <tr mat-header-row *matHeaderRowDef="colunasSubcategoria"></tr>-->
                  <!--                  <tr mat-row *matRowDef="let row; columns: colunasSubcategoria" class="hover:bg-blue-50/40"></tr>-->
                </table>
                @if (!store.isLoading() && store.subcategoriasPaginadas().length === 0) {
                  <div class="p-6 text-center text-gray-500 text-sm">
                    Nenhuma Categoria encontrada para o grupo {{ nomeCategoria?.nome }}.
                  </div>
                }
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- ======================================================= -->
        <!-- ABA 3: SUBCATEGORIAS (FILTRO + RESET + TABELA) -->
        <!-- ======================================================= -->
        <mat-tab label="SUBCATEGORIAS">
          <div class="p-4 flex flex-col flex-1 min-h-0 h-full">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-3 shrink-0">
              <!-- Filtro de Subcategoria -->
              <div class="flex items-center gap-2 w-full sm:w-1/2">
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <mat-select
                    [value]="store.filtroTipoServicoSubcategoriaId()"
                    (selectionChange)="store.onSubcategoriaFilterChange($event.value)"
                    placeholder="Selecione uma Subcategoria"
                  >
                    <mat-option [value]="null">Selecione uma Categoria</mat-option>
                    @for (sub of store.subcategoriasAtivasDropdown(); track sub.id) {
                      <mat-option
                        [class]="sub.ativo
                        ? '!font-semibold !text-blue-700'
                        : '!font-semibold !text-red-700'"
                        [value]="sub.id"
                        [hidden]="!sub.ativo"
                      >
                        {{ sub.ativo ? sub.nome : sub.nome + ' (Inativa)' }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <!-- Botão Reset / Limpar Filtro -->
                <button
                  mat-icon-button
                  type="button"
                  color="warn"
                  matTooltip="Limpar filtro de subcategoria"
                  aria-label="Limpar filtro de subcategoria"
                  [disabled]="store.filtroTipoServicoSubcategoriaId() === null"
                  (click)="store.resetFiltroTipoServico()"
                  class="!rounded-full hover:bg-red-50 transition-colors">
                  <mat-icon class="!text-red-600">filter_alt_off</mat-icon>
                </button>
              </div>
              <div
                [hidden]="store.filtroTipoServicoSubcategoriaId() !== null"
                class="text-xs text-gray-500">
                Exibindo todas as Subcategorias.
              </div>
              <div
                [hidden]="store.filtroTipoServicoSubcategoriaId() === null"
                class="text-xs text-gray-500">
                Subcategorias para a Categoria
                <span class="text-blue-700 font-bold"> {{ nomeSubcategoria?.nome?.toUpperCase() }}</span>
              </div>
            </div>

            <!-- Tabela Subcategoria -->
            <div class="border border-gray-200 rounded-lg flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
              <div class="overflow-y-auto overflow-x-auto flex-1 min-h-0 custom-scrollbar">
                <table mat-table [dataSource]="store.tiposServicoPaginados()" class="w-full">
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef class="!w-16 !font-semibold text-gray-700">ID</th>
                    <td mat-cell *matCellDef="let tipo" class="font-mono text-gray-600">{{ tipo.id }}</td>
                  </ng-container>

                  <ng-container matColumnDef="categoria">
                    <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Grupo de Demanda</th>
                    <td mat-cell *matCellDef="let tipo" class="font-medium text-blue-800">{{ tipo.categoriaNome }}</td>
                  </ng-container>

                  <ng-container matColumnDef="nome">
                    <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Serviço</th>
                    <td mat-cell *matCellDef="let tipo" class="font-semibold text-gray-800">{{ tipo.nome }}</td>
                  </ng-container>

                  <ng-container matColumnDef="descricao">
                    <th mat-header-cell *matHeaderCellDef class="!font-semibold text-gray-700">Categoria</th>
                    <td mat-cell *matCellDef="let tipo" class="font-medium text-blue-800">
                      {{ tipo.subcategoriaNome || '-' }}
                    </td>
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
                    <th mat-header-cell *matHeaderCellDef class="text-right !font-semibold text-gray-700 !w-24">Ações
                    </th>
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

                  <tr mat-header-row
                      *matHeaderRowDef="['id', 'nome', 'categoria', 'descricao', 'status', 'acoes']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['id', 'nome','categoria', 'descricao', 'status', 'acoes']"
                      class="hover:bg-blue-50/40"></tr>
                </table>

                @if (!store.isLoading() && store.tiposServicoPaginados().length === 0) {
                  <div class="p-6 text-center text-gray-500 text-sm">
                    Nenhuma subcategoria encontrada para a categoria {{ nomeSubcategoria?.nome }}.
                  </div>
                }
              </div>
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
        class="border-t border-gray-200 shrink-0"
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

  readonly nomeSubcategoriaSelecionada = computed(() => {
    const id = this.store.filtroTipoServicoSubcategoriaId();
    return this.store.subcategoriasAtivasDropdown().find(sub => sub.id === id) ?? null;
  });

  readonly nomeCategoriaSelecionada = computed(() => {
    const id = this.store.filtroSubcategoriaCategoriaId();
    return this.store.categoriasAtivasDropdown().find(cat => cat.id === id) ?? null;
  });

  ngOnInit() {
    this.store.initCatalogo();
  }

  /**
   * Abre o diálogo modal para cadastrar ou editar uma Categoria
   */
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
        this.store.loadCategoriasPaginadas();
      }
    });
  }

  /**
   * Abre o diálogo modal para cadastrar ou editar uma Subcategoria
   */
  abrirModalSubcategoria(subcategoria?: SubcategoriaResponseDTO) {
    const data: SubcategoriaDialogData = {
      subcategoria,
      categoriaIdSelecionada: this.store.filtroSubcategoriaCategoriaId() ?? undefined
    };
    const dialogRef = this.dialog.open(SubcategoriaFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      disableClose: true,
      data,
      injector: this.injector
    });

    dialogRef.afterClosed().subscribe((atualizou) => {
      if (atualizou) {
        this.store.loadSubcategoriasPaginadas();
      }
    });
  }

  /**
   * Abre o diálogo modal para cadastrar ou editar um Tipo de Serviço
   */
  abrirModalTipoServico(tipo?: TipoServicoResponseDTO) {
    const data: TipoServicoDialogData = {
      tipoServico: tipo,
      subcategoriaIdSelecionada: this.store.filtroTipoServicoSubcategoriaId() ?? undefined
    };

    const dialogRef = this.dialog.open(TipoServicoFormDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data,
      injector: this.injector
    });

    dialogRef.afterClosed().subscribe((atualizou) => {
      if (atualizou && this.categoriaSelecionadaId()) {
        this.store.loadTiposServicoPaginados();
      }
    });
  }


  /**
   * Dispara a alteração do status ativo/inativo da categoria a partir do slide-toggle
   */
  toggleStatusCategoria(cat: CategoriaDemandaResponseDTO, novoStatus: boolean) {
    this.store.alterarStatusCategoria({
      id: cat.id,
      ativo: novoStatus
    });
  }

  /**
   * Dispara a alteração do status ativo/inativo da subcategoria a partir do slide-toggle
   */
  toggleStatusSubcategoria(sub: SubcategoriaResponseDTO, novoStatus: boolean) {
    this.store.alterarStatusSubcategoria({
      id: sub.id,
      categoriaId: sub.categoriaId,
      ativo: novoStatus
    });
  }


  /**
   * Dispara a alteração do status ativo/inativo do Tipo de Serviço a partir do slide-toggle
   */
  toggleStatusTipo(tipo: TipoServicoResponseDTO, novoStatus: boolean) {
    this.store.alterarStatusTipoServico({
      id: tipo.id,
      categoriaId: tipo.subcategoriaId,
      ativo: novoStatus
    });
  }
}
