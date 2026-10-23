import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { ManutencaoCatalogoService } from '../../services/manutencao-catalogo.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { CategoriaDemandaResponseDTO, TipoServicoResponseDTO } from '../../models/manutencao-catalogo.model';

@Component({
  selector: 'app-manutencao-catalogo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDialogModule,
  ],
  template: `
    <div class="bg-gray-50 rounded-2xl p-4 md:p-6 mx-auto max-w-7xl w-full">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-blue-800 leading-tight">
            Catálogo de Serviços de Manutenção
          </h1>
          <p class="text-sm text-gray-500 mt-1">Gerencie as categorias e os tipos de serviços disponíveis</p>
        </div>
      </div>

      <mat-tab-group animationDuration="200ms" class="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <!-- Aba 1: Categorias de Demanda -->
        <mat-tab label="Categorias de Demanda">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <span class="text-xs font-semibold text-gray-500 uppercase">Lista de Categorias</span>
            </div>

            <table mat-table [dataSource]="categorias()" class="w-full">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef class="!w-16">ID</th>
                <td mat-cell *matCellDef="let cat">{{ cat.id }}</td>
              </ng-container>

              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef>Nome</th>
                <td mat-cell *matCellDef="let cat" class="font-semibold text-gray-800">{{ cat.nome }}</td>
              </ng-container>

              <ng-container matColumnDef="descricao">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let cat" class="text-gray-600">{{ cat.descricao || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="ativo">
                <th mat-header-cell *matHeaderCellDef class="text-center">Status</th>
                <td mat-cell *matCellDef="let cat" class="text-center">
                  <span [class]="cat.ativo ? 'text-emerald-700 bg-emerald-100' : 'text-gray-600 bg-gray-100'"
                        class="px-2 py-0.5 rounded-full text-xs font-semibold">
                    {{ cat.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['id', 'nome', 'descricao', 'ativo']"></tr>
              <tr
                mat-row *matRowDef="let row;
                columns: ['id', 'nome', 'descricao', 'ativo']">
              </tr>
            </table>
          </div>
        </mat-tab>

        <!-- Aba 2: Tipos de Serviço -->
        <mat-tab label="Tipos de Serviço">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <span class="text-xs font-semibold text-gray-500 uppercase">Lista de Serviços por Categoria</span>
            </div>

            <table mat-table [dataSource]="tiposServico()" class="w-full">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef class="!w-16">ID</th>
                <td mat-cell *matCellDef="let tipo">{{ tipo.id }}</td>
              </ng-container>

              <ng-container matColumnDef="categoria">
                <th mat-header-cell *matHeaderCellDef>Categoria</th>
                <td mat-cell *matCellDef="let tipo" class="font-medium text-blue-800">{{ tipo.categoriaNome }}</td>
              </ng-container>

              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef>Serviço</th>
                <td mat-cell *matCellDef="let tipo" class="font-semibold text-gray-800">{{ tipo.nome }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="text-center">Ativo</th>
                <td mat-cell *matCellDef="let tipo" class="text-center">
                  <mat-slide-toggle
                    [checked]="tipo.ativo"
                    (change)="toggleStatusTipo(tipo, $event.checked)">
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['id', 'categoria', 'nome', 'status']"></tr>
              <tr
                mat-row *matRowDef="let row;
                columns: ['id', 'categoria', 'nome', 'status']">
              </tr>
            </table>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export default class ManutencaoCatalogoPage implements OnInit {
  private readonly catalogoService = inject(ManutencaoCatalogoService);
  private readonly notification = inject(NotificationService);

  readonly categorias = signal<CategoriaDemandaResponseDTO[]>([]);
  readonly tiposServico = signal<TipoServicoResponseDTO[]>([]);

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.catalogoService.listarCategoriasAtivas().subscribe((cats) => {
      this.categorias.set(cats);
      if (cats.length > 0) {
        // Carrega os tipos da primeira categoria por padrão
        this.catalogoService.listarTiposPorCategoria(cats[0].id).subscribe((tipos) => {
          this.tiposServico.set(tipos);
        });
      }
    });
  }

  toggleStatusTipo(tipo: TipoServicoResponseDTO, novoStatus: boolean) {
    this.catalogoService.alterarStatusTipoServico(tipo.id, novoStatus).subscribe({
      next: () => {
        this.notification.success(`Status do serviço ${tipo.nome} alterado com sucesso!`, 'Catálogo');
      },
      error: () => {
        this.carregarDados();
      }
    });
  }
}
