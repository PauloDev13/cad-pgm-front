import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { form, FormField, submit } from '@angular/forms/signals';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { TipoServicoDialogData, TipoServicoModel } from '../../models/manutencao-catalogo.model';
import { formTipoServico, initialTipoServico, tipoServicoSchema } from '../../utils/manutencao-form.schemas';
import { ManutencaoStore } from '../../state/manutencao.store';
import {
  CustomAutocompleteComponent
} from '../../../../shared/components/custom-autocomplete/custom-autocomplete.component';

@Component({
  selector: 'app-tipo-servico-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FieldWrapperComponent,
    FormField,
    CustomAutocompleteComponent
  ],
  template: `
    <div class="flex justify-between items-center pr-6 pt-4 pb-0 border-gray-300 border-b">
      <h2 mat-dialog-title class="!font-bold !text-xl !text-blue-700 !m-0 !flex !items-center gap-0">
        <mat-icon class="!mr-1">{{ isEdit ? 'edit' : 'handyman' }}</mat-icon>
        {{ isEdit ? 'Editar Subcategoria' : 'Nova Subcategoria' }}
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

    <mat-dialog-content class="!p-4 !flex !flex-col gap-0">
      <form autocomplete="off" class="flex flex-col gap-0">
        <!-- Categoria Vinculada -->
        <app-field-wrapper class="mb-3" [field]="tipoForm.subcategoriaId()">
          <p class="mb-2 text-sm text-gray-600">Lista de Categorias</p>
          <app-custom-autocomplete
            [formField]="tipoForm.subcategoriaId"
            [options]="store.subcategoriasAtivasDropdown()"
            valueKey="id"
            displayKey="nome"
            label="Pesquise ou selecione a Categoria"
            placeholder="Pesquise ou selecione a Categoria"
            [clearable]="true"
          />
        </app-field-wrapper>

        <!-- Nome do Serviço -->
        <app-field-wrapper class="mb-3" [field]="tipoForm.nome()">
          <p class="mb-2 text-sm text-gray-600">Nome da Subcategoria</p>
          <mat-form-field
            appearance="outline"
            class="w-full"
            subscriptSizing="dynamic">
            <!--            <mat-label>Nome</mat-label>-->
            <input
              matInput
              [formField]="tipoForm.nome"
              placeholder="Ex: Troca de lâmpada, Reparo de vazamento"
            />
          </mat-form-field>
        </app-field-wrapper>

        <!-- Descrição -->
        <app-field-wrapper [field]="tipoForm.descricao()">
          <p class="mb-2 text-sm text-gray-600">Descrição</p>
          <mat-form-field
            appearance="outline"
            class="w-full"
            subscriptSizing="dynamic">
            <!--            <mat-label>Descrição da Subcategoria (Opcional)</mat-label>-->
            <textarea
              matInput
              rows="3"
              [formField]="tipoForm.descricao"
              placeholder="Descrição da Subcategoria (Opcional)">
            </textarea>
          </mat-form-field>
        </app-field-wrapper>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-0 items-center pt-0">
          <!-- Ordem de Exibição -->
          <app-field-wrapper [field]="tipoForm.ordemExibicao()">
            <p class="mb-2 text-sm text-gray-600">Posição no Catálogo</p>
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <!--              <mat-label>Posição no Catálogo</mat-label>-->
              <input
                matInput
                type="number"
                [formField]="tipoForm.ordemExibicao"
              />
            </mat-form-field>
          </app-field-wrapper>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!px-6 !py-3 bg-gray-50 !border-t !border-gray-300">
      <button mat-button mat-dialog-close class="!rounded-3xl">Cancelar</button>
      <button
        mat-flat-button
        class="disabled:!bg-gray-200 disabled:!text-gray-400 !rounded-3xl !bg-blue-600 !text-white"
        [disabled]="tipoForm().invalid()"
        (click)="salvar()">
        {{ isEdit ? 'Salvar Alterações' : 'Cadastrar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class TipoServicoFormDialogComponent implements OnInit {
  readonly tipoForm = form<TipoServicoModel>(
    formTipoServico, tipoServicoSchema
  );
  protected readonly store = inject(ManutencaoStore);
  private readonly dialogRef = inject(MatDialogRef<TipoServicoFormDialogComponent>);
  private readonly data = inject<TipoServicoDialogData | null>(MAT_DIALOG_DATA);
  readonly isEdit = !!(this.data && this.data?.tipoServico?.id);

  ngOnInit() {
    this.store.subcategoriasAtivasDropdown();

    const isEdit = !!(this.data && this.data?.tipoServico?.id);

    if (isEdit) {
      formTipoServico.set({
        subcategoriaId:
          this.data?.tipoServico?.subcategoriaId
          ?? this.data?.subcategoriaIdSelecionada
          ?? initialTipoServico.subcategoriaId,
        nome: this.data?.tipoServico?.nome ?? initialTipoServico.nome,
        descricao: this.data?.tipoServico?.descricao ?? initialTipoServico.descricao,
        ordemExibicao: this.data?.tipoServico?.ordemExibicao ?? initialTipoServico.ordemExibicao,
        ativo: this.data?.tipoServico ? this.data.tipoServico.ativo : initialTipoServico.ativo
      });
    } else {
      formTipoServico.set({
        ...initialTipoServico,
        subcategoriaId:
          this.data?.tipoServico?.subcategoriaId
          ?? this.data?.subcategoriaIdSelecionada
          ?? initialTipoServico.subcategoriaId
      });

    }
  }

  async salvar() {
    await submit(this.tipoForm, async (formValues) => {
      this.store.salvarTipoServico({
        isEdit: this.isEdit,
        id: this.data?.tipoServico?.id,
        categoriaId: formValues().value().subcategoriaId,
        payload: formValues().value(),
        onSuccess: () => this.dialogRef.close(true)
      });
    });
  }
}
