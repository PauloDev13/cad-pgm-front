import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { form, FormField, submit } from '@angular/forms/signals';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { ManutencaoStore } from '../../state/manutencao.store';
import { AndarCodigo } from '../../models/manutencao-enums.model';
import { aberturaChamadoSchema, formAberturaChamado } from '../../utils/manutencao-form.schemas';

@Component({
  selector: 'app-chamado-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FieldWrapperComponent,
    FormField,
  ],
  template: `
    <div class="flex justify-between items-center px-6 pt-4 pb-1">

      <h2
        mat-dialog-title
        class="!font-bold !text-xl !text-blue-700 !m-0 !p-0 !flex !items-center gap-2"
      >
        <mat-icon class="!mr-1">build</mat-icon>
        Abrir Chamado de Manutenção
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

    <mat-dialog-content class="!px-6 !py-4">
      <form autocomplete="off" class="flex flex-col gap-4">
        <!-- Localização -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">
          1. Onde está o problema?
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Andar -->
          <app-field-wrapper [field]="chamadoForm.andar()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Andar</mat-label>
              <mat-select
                [formField]="chamadoForm.andar"
                (selectionChange)="onAndarChange($event.value)"
              >
                @for (andar of store.andares(); track andar.codigo) {
                  <mat-option [value]="andar.codigo">{{ andar.rotulo }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </app-field-wrapper>

          <!-- Sala -->
          <app-field-wrapper [field]="chamadoForm.salaId()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Sala</mat-label>
              <mat-select [formField]="chamadoForm.salaId!">
                @for (sala of store.salasPorAndar(); track sala.id) {
                  <mat-option [value]="sala.id">{{ sala.numeroIdentificacao }}</mat-option>
                }
                <mat-option [value]="null">Outro local</mat-option>
              </mat-select>
            </mat-form-field>
          </app-field-wrapper>
        </div>

        @if (chamadoForm.salaId().value === null) {
          <app-field-wrapper [field]="chamadoForm.localDescricao()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Descrição do Local (Ex: Corredor, Copa, Banheiro)</mat-label>
              <input
                matInput
                [formField]="chamadoForm.localDescricao"
                placeholder="Informe detalhes do local"
              />
            </mat-form-field>
          </app-field-wrapper>
        }

        <!-- Catálogo de Serviço -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-1 mt-0">
          2. Qual é a demanda?
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Categoria -->
          <app-field-wrapper [field]="chamadoForm.categoriaId()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Categoria da Demanda</mat-label>
              <mat-select
                [formField]="chamadoForm.categoriaId"
                (selectionChange)="onCategoriaChange($event.value)"
              >
                @for (cat of store.categorias(); track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.nome }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </app-field-wrapper>

          <!-- Tipo de Serviço -->
          <app-field-wrapper [field]="chamadoForm.tipoServicoId()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Tipo de Serviço</mat-label>
              <mat-select [formField]="chamadoForm.tipoServicoId">
                @for (tipo of store.tiposPorCategoria(); track tipo.id) {
                  <mat-option [value]="tipo.id">{{ tipo.nome }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </app-field-wrapper>
        </div>

        <!-- Descrição Detalhada -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-0 mt-0">
          3. Detalhamento
        </h3>
        <app-field-wrapper [field]="chamadoForm.descricao()">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Descrição detalhada da solicitação</mat-label>
            <textarea
              matInput
              rows="4"
              [formField]="chamadoForm.descricao"
              placeholder="Descreva o problema com o máximo de informações..."
            >
            </textarea>
          </mat-form-field>
        </app-field-wrapper>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-6 !py-3 bg-gray-50 !border-t !border-gray-400">
      <button mat-button mat-dialog-close class="!rounded-3xl">Cancelar</button>
      <button
        mat-flat-button
        class="!rounded-3xl !bg-blue-600 !text-white"
        [disabled]="store.isLoading()"
        (click)="salvar()"
      >
        Abrir Chamado
      </button>
    </mat-dialog-actions>
  `,
})
export class ChamadoFormComponent implements OnInit {
  protected readonly store = inject(ManutencaoStore);
  private readonly dialogRef = inject(MatDialogRef<ChamadoFormComponent>);

  readonly chamadoForm = form(formAberturaChamado, aberturaChamadoSchema);

  ngOnInit() {
    this.store.loadAndares();
    this.store.loadCategoriasAtivas();
    this.store.loadSalasPorAndar(AndarCodigo.TERREO);

    // Limpa os dados do formulário após salvar
    formAberturaChamado.set({
      descricao: '',
      andar: AndarCodigo.TERREO,
      salaId: null,
      categoriaId: 0,
      localDescricao: '',
      tipoServicoId: 0
    });
  }

  onAndarChange(andar: AndarCodigo) {
    if (andar) {
      this.store.loadSalasPorAndar(andar);
    }
  }

  onCategoriaChange(categoriaId: number) {
    if (categoriaId) {
      this.store.loadTiposAtivosPorCategoria(categoriaId);
    }
  }

  async salvar() {
    await submit(this.chamadoForm, async (formValues) => {
      this.store.abrirChamado({
        payload: formValues().value(),
        onSuccess: () => {
          this.dialogRef.close(true);
        },
      });
    });
  }
}
