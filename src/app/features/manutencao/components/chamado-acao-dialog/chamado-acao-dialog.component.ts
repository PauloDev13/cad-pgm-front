import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { form, FormField, submit } from '@angular/forms/signals';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { ManutencaoStore } from '../../state/manutencao.store';
import {
  atribuicaoChamadoSchema,
  cancelarChamadoSchema,
  concluirChamadoSchema,
  formAtribuicaoModel,
  formCancelarModel,
  formConcluirModel,
  formIniciarModel,
  iniciarAtendimentoSchema
} from '../../utils/manutencao-form.schemas';
import { ManutencaoChamadoService } from '../../services/manutencao-chamado.service';
import { ResponsavelComboResponseDTO } from '../../models/manutencao-chamado.model';
import { FormFluxoChamadoComponent } from '../../utils/form-fluxo-chamado.component';

export type TipoAcaoChamado = 'ATRIBUIR' | 'INICIAR' | 'CONCLUIR' | 'CANCELAR';

export interface DialogAcaoData {
  tipo: TipoAcaoChamado;
  chamadoId: number;
}

@Component({
  selector: 'app-chamado-acao-dialog',
  standalone: true,
  providers: [ManutencaoStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FieldWrapperComponent,
    FormField,
    FormFluxoChamadoComponent,
  ],
  template: `
    <div class="flex justify-between items-center px-6 pt-2 pb-0 border-gray-300 border-b">
      <h2
        mat-dialog-title
        class="!font-bold !text-lg !text-blue-700 !m-0 !flex !pl-0 !items-center gap-0">
        <mat-icon [class]="getIconColor()">{{ getIcon() }}</mat-icon>
        {{ getTitulo() }}
      </h2>
      <button
        mat-icon-button
        mat-dialog-close
        class="!w-8 !h-8 !flex !items-center !justify-center !bg-blue-600 hover:!bg-blue-500
        !text-white !rounded-full"
      >
        <mat-icon class="!scale-90">close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!p-6 !pb-2">
      <!-- 1. ATRIBUIR RESPONSÁVEL -->
      @if (data.tipo === 'ATRIBUIR') {
        <form autocomplete="off" class="flex flex-col gap-4">
          <p class="text-xs text-gray-500 m-0">
            Selecione o servidor/técnico responsável pela execução deste chamado.
          </p>
          <app-field-wrapper [field]="formAtribuicao.responsavelId()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Responsável</mat-label>
              <mat-select [formField]="formAtribuicao.responsavelId">
                @for (responsavel of servidoresDisponiveis(); track responsavel.id) {
                  <mat-option [value]="responsavel.id">
                    {{ responsavel.nome }} <span class="text-xs text-gray-400">({{ responsavel.email }})</span>
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </app-field-wrapper>

          <app-field-wrapper [field]="formAtribuicao.observacao()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Observação de Atribuição (Opcional)</mat-label>
              <textarea
                matInput
                rows="3"
                [formField]="formAtribuicao.observacao"
                placeholder="Instruções ou motivos"
              ></textarea>
            </mat-form-field>
          </app-field-wrapper>
        </form>
      }

      <!-- 2. INICIAR ATENDIMENTO -->
      @if (data.tipo === 'INICIAR') {
        <app-form-fluxo-chamado
        titleMessage="Confirma o início dos reparos técnicos para este chamado?"
        label="Observações Iniciais (Opcional)"
        [rowsValue]="3"
        placeholder="Ex: Deslocando-se para o local"
        [fieldValue]="formIniciar.observacao()"
        [formControlField]="formIniciar.observacao"
        />
      }

      <!-- 3. CONCLUIR ATENDIMENTO -->
      @if (data.tipo === 'CONCLUIR') {
        <app-form-fluxo-chamado
          titleMessage="Descreva os procedimentos executados para a finalização do chamado."
          label="Laudo/Observação Conclusiva"
          placeholder="Ex: Peças trocadas, reparo testado e normalizado"
          [fieldValue]="formConcluir.observacao()"
          [formControlField]="formConcluir.observacao"
        />
      }

      <!-- 4. CANCELAR CHAMADO -->
      @if (data.tipo === 'CANCELAR') {
        <app-form-fluxo-chamado
          titleMessage="Atenção: O cancelamento encerra o ciclo deste chamado."
          label="Motivo do Cancelamento"
          placeholder="Justifique o motivo do cancelamento"
          classValue="text-xs text-rose-600 font-medium m-0"
          [fieldValue]="formCancelar.motivo()"
          [formControlField]="formCancelar.motivo"
        />
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-6 !py-3 bg-gray-50 !border-t !border-gray-300">
      <button mat-button mat-dialog-close class="!rounded-3xl">Fechar</button>
      <button
        mat-flat-button
        [class]="getBotaoClass()"
        [disabled]="store.isLoading()"
        (click)="confirmar()"
      >
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
})
export class ChamadoAcaoDialogComponent implements OnInit {
  protected readonly data = inject<DialogAcaoData>(MAT_DIALOG_DATA);
  protected readonly store = inject(ManutencaoStore);
  private readonly chamadoService = inject(ManutencaoChamadoService);
  private readonly dialogRef = inject(MatDialogRef<ChamadoAcaoDialogComponent>);

  readonly servidoresDisponiveis = signal<ResponsavelComboResponseDTO[]>([]);

  readonly formAtribuicao = form(formAtribuicaoModel, atribuicaoChamadoSchema);
  readonly formIniciar = form(formIniciarModel, iniciarAtendimentoSchema);
  readonly formConcluir = form(formConcluirModel, concluirChamadoSchema);
  readonly formCancelar = form(formCancelarModel, cancelarChamadoSchema);

  ngOnInit() {
    if (this.data.tipo === 'ATRIBUIR') {
      this.chamadoService.listarResponsaveisDisponiveis().subscribe((res) => {
        this.servidoresDisponiveis.set(res);
      });
    }
  }

  getTitulo(): string {
    switch (this.data.tipo) {
      case 'ATRIBUIR':
        return 'Atribuir Responsável';
      case 'INICIAR':
        return 'Iniciar Atendimento';
      case 'CONCLUIR':
        return 'Concluir Atendimento';
      case 'CANCELAR':
        return 'Cancelar Chamado';
    }
  }

  getIcon(): string {
    switch (this.data.tipo) {
      case 'ATRIBUIR':
        return 'person_add';
      case 'INICIAR':
        return 'play_arrow';
      case 'CONCLUIR':
        return 'task_alt';
      case 'CANCELAR':
        return 'cancel';
    }
  }

  getIconColor(): string {
    const base = '!mr-2 ';
    switch (this.data.tipo) {
      case 'ATRIBUIR':
        return base + '!text-blue-600';
      case 'INICIAR':
        return base + '!text-indigo-600';
      case 'CONCLUIR':
        return base + '!text-emerald-600';
      case 'CANCELAR':
        return base + '!text-rose-600';
    }
  }

  getBotaoClass(): string {
    const base = '!rounded-3xl !text-white ';
    switch (this.data.tipo) {
      case 'ATRIBUIR':
        return base + '!bg-blue-600';
      case 'INICIAR':
        return base + '!bg-indigo-600';
      case 'CONCLUIR':
        return base + '!bg-emerald-600';
      case 'CANCELAR':
        return base + '!bg-rose-600';
    }
  }

  async confirmar() {
    const chamadoId = this.data.chamadoId;

    switch (this.data.tipo) {
      case 'ATRIBUIR':
        await submit(this.formAtribuicao, async (field) => {
          this.store.atribuirResponsavel({
            id: chamadoId,
            payload: field().value(),
            onSuccess: () => this.dialogRef.close(true),
          });
        });
        break;

      case 'INICIAR':
        await submit(this.formIniciar, async (field) => {
          this.store.iniciarAtendimento({
            id: chamadoId,
            payload: field().value(),
            onSuccess: () => this.dialogRef.close(true),
          });
        });
        break;

      case 'CONCLUIR':
        await submit(this.formConcluir, async (field) => {
          this.store.concluirAtendimento({
            id: chamadoId,
            payload: field().value(),
            onSuccess: () => this.dialogRef.close(true),
          });
        });
        break;

      case 'CANCELAR':
        await submit(this.formCancelar, async (field) => {
          this.store.cancelarChamado({
            id: chamadoId,
            payload: field().value(),
            onSuccess: () => this.dialogRef.close(true),
          });
        });
        break;
    }
  }
}
