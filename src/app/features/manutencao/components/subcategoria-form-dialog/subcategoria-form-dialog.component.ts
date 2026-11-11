import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper/field-wrapper.component';
import { form, FormField, submit } from '@angular/forms/signals';
import { ManutencaoStore } from '../../state/manutencao.store';
import { SubcategoriaDialogData, SubcategoriaModel } from '../../models/manutencao-catalogo.model';
import { formSubcategoria, initialSubcategoria, subcategoriaSchema } from '../../utils/manutencao-form.schemas';
import {
  CustomAutocompleteComponent
} from '../../../../shared/components/custom-autocomplete/custom-autocomplete.component';

@Component({
  selector: 'app-subcategoria-form-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    // MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FieldWrapperComponent,
    FormField,
    CustomAutocompleteComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Cabeçalho Dinâmico -->
    <div class="flex justify-between items-center pr-6 pt-4 pb-0 border-gray-300 border-b">
      <h2 mat-dialog-title class="!font-bold !text-xl !text-blue-700 !m-0 !flex !items-center gap-0">
        <mat-icon class="!mr-1">{{ isEdit ? 'edit' : 'account_tree' }}</mat-icon>
        {{ isEdit ? 'Editar Categoria' : 'Nova Categoria' }}
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
    <!-- Conteúdo do Formulário -->
    <mat-dialog-content class="!p-4 !flex !flex-col gap-0">
      <form autocomplete="off" class="flex flex-col gap-0">
        <!-- 1. Categoria Pai Vinculada -->
        <app-field-wrapper [field]="subcategoriaForm.categoriaId()">
          <p class="mb-2 text-sm text-gray-600">
            Grupo de Demanda
          </p>

          <app-custom-autocomplete
            [formField]="subcategoriaForm.categoriaId"
            [options]="store.categorias()"
            valueKey="id"
            displayKey="nome"
            placeholder="Pesquise ou selecione um Grupo"
            [clearable]="false"
          />
          <!--          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">-->
          <!--            <mat-label>Categoria</mat-label>-->
          <!--            <mat-select-->
          <!--              [formField]="subcategoriaForm.categoriaId"-->
          <!--              placeholder="Selecione uma categoria"-->
          <!--            >-->
          <!--              <mat-option [value]="0">Selecione um Grupo de Demanda</mat-option>-->
          <!--              @for (cat of store.categorias(); track cat.id) {-->
          <!--                <mat-option-->
          <!--                  [class]="cat.ativo ? '!font-semibold !text-blue-700' : '!font-semibold !text-red-700'"-->
          <!--                  [value]="cat.id"-->
          <!--                  [hidden]="!cat.ativo"-->
          <!--                >-->
          <!--                  {{ cat.ativo ? cat.nome : cat.nome + ' (Inativa)' }}-->
          <!--                </mat-option>-->
          <!--              }-->
          <!--            </mat-select>-->
          <!--          </mat-form-field>-->
        </app-field-wrapper>
        <!-- 2. Nome da Subcategoria -->
        <app-field-wrapper [field]="subcategoriaForm.nome()">
          <p class="mb-2 text-sm text-gray-600">
            Categoria
          </p>
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Nome da Categoria</mat-label>
            <input
              matInput
              [formField]="subcategoriaForm.nome"
              placeholder="Ex: Cadeiras e Longarinas, Ar-condicionado Split"
            />
          </mat-form-field>
        </app-field-wrapper>
        <!-- 3. Descrição Detalhada -->
        <app-field-wrapper [field]="subcategoriaForm.descricao()">
          <p class="mb-2 text-sm text-gray-600">
            Descrição
          </p>
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Descrição da Categoria (Opcional)</mat-label>
            <textarea
              matInput
              rows="3"
              [formField]="subcategoriaForm.descricao"
              placeholder="Detalhes ou orientações sobre os serviços desta subcategoria"
            ></textarea>
          </mat-form-field>
        </app-field-wrapper>
        <!-- 4. Grade: Prazo Estimado e Ordem de Exibição -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
          <!-- Prazo Estimado em Dias -->
          <app-field-wrapper [field]="subcategoriaForm.prazoEstimadoDias()">
            <p class="mb-2 text-sm text-gray-600">
              Prazo Estimado (Dias Úteis)
            </p>
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Dias para conclusão</mat-label>
              <input
                matInput
                type="number"
                [formField]="subcategoriaForm.prazoEstimadoDias"
                placeholder="Ex: 3"
              />
            </mat-form-field>
          </app-field-wrapper>
          <!-- Ordem de Exibição -->
          <app-field-wrapper [field]="subcategoriaForm.ordemExibicao()">
            <p class="mb-2 text-sm text-gray-600">
              Ordem de Exibição
            </p>
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Posição no Catálogo</mat-label>
              <input
                matInput
                type="number"
                [formField]="subcategoriaForm.ordemExibicao"
              />
            </mat-form-field>
          </app-field-wrapper>
        </div>
        <!-- 5. Toggles: Requer Tombamento e Status Ativo -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 pb-1 border-t border-gray-100 mt-2">
          <!-- Requer Tombamento -->
          <div class="flex items-center gap-2">
            <mat-slide-toggle
              color="primary"
              labelPosition="after"
              [checked]="subcategoriaForm.requerTombamento().value()"
              (change)="subcategoriaForm.requerTombamento().value.set($event.checked)"
            >
              <span class="text-sm font-medium text-gray-700">Exige nº de tombo/patrimônio</span>
            </mat-slide-toggle>
          </div>
          <!-- Ativo / Inativo -->
          <div class="flex items-center gap-2">
            <mat-slide-toggle
              color="primary"
              labelPosition="after"
              [checked]="subcategoriaForm.ativo().value()"
              (change)="subcategoriaForm.ativo().value.set($event.checked)"
            >
              <span class="text-sm font-medium text-gray-700">Categoria Ativa</span>
            </mat-slide-toggle>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <!-- Ações do Diálogo -->
    <mat-dialog-actions align="end" class="!px-6 !py-3 bg-gray-50 !border-t !border-gray-300">
      <button mat-button mat-dialog-close class="!rounded-3xl">Cancelar</button>
      <button
        mat-flat-button
        class="disabled:!bg-gray-200 disabled:!text-gray-400 !rounded-3xl !bg-blue-600 !text-white"
        [disabled]="subcategoriaForm().invalid()"
        (click)="salvar()"
      >
        {{ isEdit ? 'Salvar Alterações' : 'Cadastrar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class SubcategoriaFormDialogComponent implements OnInit {
  protected readonly store = inject(ManutencaoStore);
  private readonly dialogRef = inject(MatDialogRef<SubcategoriaFormDialogComponent>);
  private readonly data = inject<SubcategoriaDialogData | null>(MAT_DIALOG_DATA);
  readonly isEdit = !!(this.data && this.data.subcategoria?.id);

  readonly subcategoriaForm = form<SubcategoriaModel>(
    formSubcategoria,
    subcategoriaSchema
  );

  ngOnInit() {
    this.store.loadCategoriasAtivas();

    const isEdit = !!(this.data && this.data.subcategoria?.id);

    if (isEdit) {
      formSubcategoria.set({
        categoriaId:
          this.data?.subcategoria?.categoriaId
          ?? this.data?.categoriaIdSelecionada
          ?? initialSubcategoria.categoriaId,
        nome: this.data?.subcategoria?.nome ?? initialSubcategoria.nome,
        descricao: this.data?.subcategoria?.descricao ?? initialSubcategoria.descricao,
        ordemExibicao: this.data?.subcategoria?.ordemExibicao ?? initialSubcategoria.ordemExibicao,
        prazoEstimadoDias: this.data?.subcategoria?.prazoEstimadoDias ?? initialSubcategoria.prazoEstimadoDias,
        requerTombamento: this.data?.subcategoria?.requerTombamento ?? initialSubcategoria.requerTombamento,
        ativo: this.data?.subcategoria ? this.data.subcategoria.ativo : initialSubcategoria.ativo
      });
    } else {
      formSubcategoria.set({
        ...initialSubcategoria,
        categoriaId: this.data?.categoriaIdSelecionada ?? 0
      });
    }
  }

  async salvar() {
    await submit(this.subcategoriaForm, async (formValues) => {
      this.store.salvarSubcategoria({
        isEdit: this.isEdit,
        id: this.data?.subcategoria?.id,
        categoriaId: formValues().value().categoriaId,
        payload: formValues().value(),
        onSuccess: () => this.dialogRef.close(true)
      });
    });
  }
}
