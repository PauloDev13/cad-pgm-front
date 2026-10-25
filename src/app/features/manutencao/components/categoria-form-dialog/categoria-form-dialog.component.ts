import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { form, FormField, submit } from '@angular/forms/signals';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { CategoriaDemandaModel, CategoriaDemandaResponseDTO } from '../../models/manutencao-catalogo.model';
import {
  categoriaDemandaSchema,
  formCategoriaDemanda,
  initialCategoriaDemanda
} from '../../utils/manutencao-form.schemas';
import { ManutencaoStore } from '../../state/manutencao.store';

@Component({
  selector: 'app-categoria-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FieldWrapperComponent,
    FormField
  ],
  template: `
    <div class="flex justify-between items-center px-6 pt-4 pb-2 border-b">
      <h2 mat-dialog-title class="!font-bold !text-xl !text-blue-700 !m-0 flex items-center gap-2">
        <mat-icon>{{ isEdit ? 'edit' : 'category' }}</mat-icon>
        {{ isEdit ? 'Editar Categoria' : 'Nova Categoria' }}
      </h2>
      <button mat-icon-button mat-dialog-close class="!rounded-full">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!p-6">
      <form autocomplete="off" class="flex flex-col gap-4">
        <!-- Nome -->
        <app-field-wrapper [field]="categoriaForm.nome()">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Nome da Categoria</mat-label>
            <input
              matInput
              [formField]="categoriaForm.nome"
              placeholder="Ex: Elétrica, Hidráulica, Climatização"
            />
          </mat-form-field>
        </app-field-wrapper>

        <!-- Descrição -->
        <app-field-wrapper [field]="categoriaForm.descricao()">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Descrição (Opcional)</mat-label>
            <textarea
              matInput
              rows="3"
              [formField]="categoriaForm.descricao"
              placeholder="Breve detalhamento sobre o escopo desta categoria">
            </textarea>
          </mat-form-field>
        </app-field-wrapper>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
          <!-- Ordem de Exibição -->
          <app-field-wrapper [field]="categoriaForm.ordemExibicao()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Ordem de Exibição</mat-label>
              <input
                matInput
                type="number"
                [formField]="categoriaForm.ordemExibicao"
              />
            </mat-form-field>
          </app-field-wrapper>

          <!-- Ativo / Inativo -->
          <div class="flex items-center gap-3 pt-2">
            <mat-slide-toggle
              [checked]="categoriaForm.ativo().value()"
              (change)="categoriaForm.ativo().value.set($event.checked)">
              Categoria Ativa
            </mat-slide-toggle>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!px-6 !py-3 bg-gray-50 border-t border-gray-200">
      <button mat-button mat-dialog-close class="!rounded-3xl">Cancelar</button>
      <button
        mat-flat-button
        class="!rounded-3xl !bg-blue-600 !text-white"
        [disabled]="store.isLoading()"
        (click)="salvar()">
        {{ isEdit ? 'Salvar Alterações' : 'Cadastrar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class CategoriaFormDialogComponent implements OnInit {
  protected readonly store = inject(ManutencaoStore);
  private readonly dialogRef = inject(MatDialogRef<CategoriaFormDialogComponent>);
  private readonly data = inject<CategoriaDemandaResponseDTO | null>(MAT_DIALOG_DATA);

  readonly isEdit = !!(this.data && this.data?.id);

  readonly categoriaForm = form<CategoriaDemandaModel>(
    formCategoriaDemanda, categoriaDemandaSchema
  );

  ngOnInit() {
    if (this.data && this.data?.id) {
      formCategoriaDemanda.set({
        nome: this.data?.nome,
        descricao: this.data?.descricao ?? initialCategoriaDemanda.descricao,
        ordemExibicao: this.data?.ordemExibicao ?? initialCategoriaDemanda.ordemExibicao,
        ativo: this.data?.ativo
      });
    }
  }

  async salvar() {
    await submit(this.categoriaForm, async (formValues) => {
      this.store.salvarCategoria({
        isEdit: this.isEdit,
        id: this.data?.id,
        payload: formValues().value(),
        onSuccess: () => this.dialogRef.close(true)
      });
    });
  }
}
