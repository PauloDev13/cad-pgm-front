import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ManutencaoStore } from '../../state/manutencao.store';
import { AuthStore } from '../../../../core/auth/store/auth.store';
import { EstadoChamado } from '../../models/manutencao-enums.model';
import { ChamadoAcaoDialogComponent } from '../chamado-acao-dialog/chamado-acao-dialog.component';

@Component({
  selector: 'app-chamado-detalhe-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    @if (store.chamadoDetalhe(); as chamado) {
      <div class="flex justify-between items-center px-6 pt-4 pb-2 border-b">
        <div>
          <span class="text-xs font-mono font-bold text-blue-600 uppercase">{{ chamado.protocolo }}</span>
          <h2 class="text-xl font-bold text-gray-800 m-0">{{ chamado.tipoServicoNome }}</h2>
        </div>
        <button mat-icon-button mat-dialog-close class="!rounded-full">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="!p-6 flex flex-col gap-6 max-h-[80vh]">
        <!-- Painel Superior: Dados Gerais -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div>
            <span class="text-xs text-gray-500 font-medium">Localização</span>
            <p class="font-semibold text-gray-800 m-0">{{ chamado.rotuloAndar }} - {{ chamado.salaNome || chamado.localDescricao }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-500 font-medium">Solicitante</span>
            <p class="font-semibold text-gray-800 m-0">{{ chamado.solicitanteNome }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-500 font-medium">Responsável</span>
            <p class="font-semibold text-gray-800 m-0">{{ chamado.responsavelNome || 'Aguardando atribuição' }}</p>
          </div>
        </div>

        <!-- Descrição -->
        <div>
          <h4 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Descrição do Problema</h4>
          <p class="text-gray-700 bg-white p-3 rounded-lg border border-gray-200 text-sm whitespace-pre-wrap">
            {{ chamado.descricaoProblema }}
          </p>
        </div>

        <!-- Linha do Tempo (Timeline) -->
        <div>
          <h4 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Histórico de Movimentações</h4>
          <div class="relative border-l-2 border-blue-300 ml-4 pl-4 flex flex-col gap-4">
            @for (item of chamado.historico; track item.id) {
              <div class="relative group">
                <div class="absolute -left-[23px] top-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-sm text-gray-800">{{ item.descricaoEvento }}</span>
                  <span class="text-xs text-gray-400">{{ item.dataHora | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <p class="text-xs text-gray-600 m-0">Executado por: <span class="font-medium">{{ item.atorNome }}</span></p>
                @if (item.observacao) {
                  <p class="text-xs italic text-gray-500 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                    "{{ item.observacao }}"
                  </p>
                }
              </div>
            }
          </div>
        </div>
      </mat-dialog-content>

      <!-- Ações de Ciclo de Vida -->
      <mat-dialog-actions align="end" class="!px-6 !py-3 bg-gray-50 border-t border-gray-200 gap-2">
        <!-- Cancelar (Solicitante ou Admin se não finalizado) -->
        @if (podeCancelar(chamado)) {
          <button mat-stroked-button color="warn" class="!rounded-3xl" (click)="abrirAcao('CANCELAR')">
            Cancelar Chamado
          </button>
        }

        <!-- Atribuir Técnico (Almoxarifado / Admin) -->
        @if (podeAtribuir(chamado)) {
          <button mat-flat-button class="!rounded-3xl !bg-blue-600 !text-white" (click)="abrirAcao('ATRIBUIR')">
            Atribuir Responsável
          </button>
        }

        <!-- Iniciar Atendimento (Técnico / Almoxarifado) -->
        @if (chamado.estado === 'ATRIBUIDO' && authStore.canEdit()) {
          <button mat-flat-button class="!rounded-3xl !bg-indigo-600 !text-white" (click)="abrirAcao('INICIAR')">
            Iniciar Atendimento
          </button>
        }

        <!-- Concluir (Técnico / Almoxarifado) -->
        @if (chamado.estado === 'EM_ATENDIMENTO' && authStore.canEdit()) {
          <button mat-flat-button class="!rounded-3xl !bg-emerald-600 !text-white" (click)="abrirAcao('CONCLUIR')">
            Concluir Chamado
          </button>
        }
      </mat-dialog-actions>
    }
  `
})
export class ChamadoDetalheDialogComponent implements OnInit {
  protected readonly store = inject(ManutencaoStore);
  protected readonly authStore = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly dataId = inject<number>(MAT_DIALOG_DATA);

  ngOnInit() {
    this.store.loadDetalhes(this.dataId);
  }

  podeCancelar(chamado: any): boolean {
    return chamado.estado !== EstadoChamado.CONCLUIDO && chamado.estado !== EstadoChamado.CANCELADO;
  }

  podeAtribuir(chamado: any): boolean {
    return this.authStore.canEdit()
      && chamado.estado !== EstadoChamado.CONCLUIDO
      && chamado.estado !== EstadoChamado.CANCELADO;
  }

  abrirAcao(tipo: 'ATRIBUIR' | 'INICIAR' | 'CONCLUIR' | 'CANCELAR') {
    const dialogRef = this.dialog.open(ChamadoAcaoDialogComponent, {
      width: '500px',
      data: { tipo, chamadoId: this.dataId }
    });
    dialogRef.afterClosed().subscribe((sucesso) => {
      if (sucesso) {
        this.store.loadDetalhes(this.dataId);
        this.store.reloadList();
      }
    });
  }
}
