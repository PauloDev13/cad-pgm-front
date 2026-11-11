import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
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
import { AndarCodigo, PRIORIDADE_CHAMADO_LABELS, PrioridadeChamado } from '../../models/manutencao-enums.model';
import {
  aberturaChamadoSchema,
  formAberturaChamado,
  initialAberturaChamado
} from '../../utils/manutencao-form.schemas';
import {
  CustomAutocompleteComponent
} from '../../../../shared/components/custom-autocomplete/custom-autocomplete.component';

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
    CustomAutocompleteComponent
  ],
  template: `
    <!-- Cabeçalho do Diálogo -->
    <div class="flex justify-between items-center px-6 pt-4 pb-1 border-b border-gray-200">

      <h2
        mat-dialog-title
        class="!font-bold !text-xl !text-blue-700 !m-0 !p-0 !flex !items-center gap-2"
      >
        <mat-icon class="!mr-1">build</mat-icon>
        Abrir Chamado
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
    <mat-dialog-content class="!px-6 !py-4 custom-scrollbar max-h-[78vh]">
      <form autocomplete="off" class="flex flex-col gap-4">
        <!-- ========================================== -->
        <!-- SEÇÃO 1: LOCALIZAÇÃO                       -->
        <!-- ========================================== -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-1 m-0">
          1. Onde está o problema?
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- 1. Andar -->
          <app-field-wrapper [field]="chamadoForm.andar()">
            <app-custom-autocomplete
              [formField]="chamadoForm.andar!"
              [options]="store.andares()"
              valueKey="codigo"
              displayKey="rotulo"
              placeholder="Selecione o Andar"
              (selectionChange)="onAndarChange($event)"
              [clearable]="true"
            />
          </app-field-wrapper>

          <!-- 2. Sala -->
          <app-field-wrapper [field]="chamadoForm.salaId()">
            <app-custom-autocomplete
              [formField]="chamadoForm.salaId!"
              [options]="salasComOpcaoOutro()"
              valueKey="id"
              displayKey="numeroIdentificacao"
              placeholder="Selecione a Sala"
              [clearable]="true"
            />
          </app-field-wrapper>
        </div>
        <!--          <app-field-wrapper [field]="chamadoForm.andar()">-->
        <!--            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">-->
        <!--              <mat-select-->
        <!--                [formField]="chamadoForm.andar!"-->
        <!--                (selectionChange)="onAndarChange($event.value)"-->
        <!--                placeholder="Selecione o Andar"-->
        <!--              >-->
        <!--                <mat-option class="!text-red-700" [value]="null">Selecione o Andar</mat-option>-->
        <!--                @for (andar of store.andares(); track andar.codigo) {-->
        <!--                  <mat-option class="!text-blue-800" [value]="andar.codigo">{{ andar.rotulo }}</mat-option>-->
        <!--                }-->
        <!--              </mat-select>-->
        <!--            </mat-form-field>-->
        <!--          </app-field-wrapper>-->

        <!--          &lt;!&ndash; Sala &ndash;&gt;-->
        <!--          <app-field-wrapper [field]="chamadoForm.salaId()">-->
        <!--            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">-->
        <!--              <mat-select-->
        <!--                [formField]="chamadoForm.salaId!"-->
        <!--                placeholder="Selecione a Sala"-->
        <!--              >-->
        <!--                <mat-option class="!text-red-700" [value]="null">Selecione a sala</mat-option>-->
        <!--                @for (sala of store.salasPorAndar(); track sala.id) {-->
        <!--                  <mat-option class="!text-blue-800" [value]="sala.id">{{ sala.numeroIdentificacao }}</mat-option>-->
        <!--                }-->
        <!--                <mat-option [value]="30">Outro local</mat-option>-->
        <!--              </mat-select>-->
        <!--            </mat-form-field>-->
        <!--          </app-field-wrapper>-->
        <!--        </div>-->

        <!-- Descrição textual se "Outro local" -->
        @if (chamadoForm.salaId().value() === 30) {
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

        <!-- ========================================== -->
        <!-- SEÇÃO 2: DEMANDA (CASCATA TRIPLA)          -->
        <!-- ========================================== -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-1 mt-0">
          2. Qual é a demanda? (Catálogo)
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- 1º Nível: Categoria -->
          <app-field-wrapper [field]="chamadoForm.categoriaId()">
            <app-custom-autocomplete
              [formField]="chamadoForm.categoriaId"
              [options]="store.categorias()"
              valueKey="id"
              displayKey="nome"
              placeholder="Selecione a Categoria"
              (selectionChange)="onCategoriaChange($event)"
              [clearable]="true"
            />
          </app-field-wrapper>
          <!--          <app-field-wrapper [field]="chamadoForm.categoriaId()">-->
          <!--            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">-->
          <!--              <mat-select-->
          <!--                [formField]="chamadoForm.categoriaId"-->
          <!--                (selectionChange)="onCategoriaChange($event.value)"-->
          <!--                placeholder="Selecione a Categoria"-->
          <!--              >-->
          <!--                <mat-option class="!text-red-700" [value]="null">Selecione uma Categoria</mat-option>-->
          <!--                @for (cat of store.categorias(); track cat.id) {-->
          <!--                  <mat-option class="!text-blue-800" [value]="cat.id">{{ cat.nome }}</mat-option>-->
          <!--                }-->
          <!--              </mat-select>-->
          <!--            </mat-form-field>-->
          <!--          </app-field-wrapper>-->

          <!-- 2º Nível: Subcategoria -->
          <app-field-wrapper [field]="chamadoForm.subcategoriaId()">
            <app-custom-autocomplete
              [formField]="chamadoForm.subcategoriaId"
              [options]="store.subcategoriasAtivas()"
              valueKey="id"
              displayKey="nome"
              placeholder="Selecione a Subcategoria"
              (selectionChange)="onSubcategoriaChange($event)"
              [clearable]="true"
            />
          </app-field-wrapper>
          <!--          <app-field-wrapper [field]="chamadoForm.subcategoriaId()">-->
          <!--            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">-->
          <!--              <mat-select-->
          <!--                [formField]="chamadoForm.subcategoriaId"-->
          <!--                (selectionChange)="onSubcategoriaChange($event.value)"-->
          <!--                placeholder="Selecione a Subcategoria"-->
          <!--              >-->
          <!--                <mat-option class="!text-red-700" [value]="null">Selecione a Subcategoria</mat-option>-->
          <!--                @for (sub of store.subcategoriasAtivas(); track sub.id) {-->
          <!--                  <mat-option class="!text-blue-800" [value]="sub.id">{{ sub.nome }}</mat-option>-->
          <!--                }-->
          <!--              </mat-select>-->
          <!--            </mat-form-field>-->
          <!--          </app-field-wrapper>-->

          <!-- 3º Nível: Tipo de Serviço -->
          <app-field-wrapper [field]="chamadoForm.tipoServicoId()">
            <app-custom-autocomplete
              [formField]="chamadoForm.tipoServicoId"
              [options]="store.tiposPorCategoria()"
              valueKey="id"
              displayKey="nome"
              placeholder="Selecione o Tipo de Serviço"
              [clearable]="true"
            />
          </app-field-wrapper>
          <!--          <app-field-wrapper [field]="chamadoForm.tipoServicoId()">-->
          <!--            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">-->
          <!--              <mat-select-->
          <!--                [formField]="chamadoForm.tipoServicoId"-->
          <!--                placeholder="Selecione o Tipo de Serviço"-->
          <!--              >-->
          <!--                <mat-option class="!text-red-700" [value]="null">Selecione o Tipo de Serviço</mat-option>-->
          <!--                @for (tipo of store.tiposPorCategoria(); track tipo.id) {-->
          <!--                  <mat-option class="!text-blue-800" [value]="tipo.id">{{ tipo.nome }}</mat-option>-->
          <!--                }-->
          <!--              </mat-select>-->
          <!--            </mat-form-field>-->
          <!--          </app-field-wrapper>-->
        </div>

        <!-- ========================================== -->
        <!-- SEÇÃO 3: PARÂMETROS E INTEGRAÇÃO           -->
        <!-- ========================================== -->
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-1 mt-1 mb-0">
          3. Prioridade, Prazos e Integrações
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Prioridade -->
          <app-field-wrapper [field]="chamadoForm.prioridade()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-select [formField]="chamadoForm.prioridade!">
                @for (prio of listaPrioridades; track prio) {
                  <mat-option [value]="prio">
                    <span [class]="getPrioridadeClass(prio)">{{ rotulosPrioridade[prio] }}</span>
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </app-field-wrapper>
          <!-- Prazo de Conclusão Estimado -->
          <app-field-wrapper [field]="chamadoForm.prazoConclusao!()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Prazo Limite de Conclusão</mat-label>
              <input
                matInput
                type="date"
                [formField]="chamadoForm.prazoConclusao"
              />
            </mat-form-field>
          </app-field-wrapper>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Móvel / Tombamento Patrimonial -->
          <app-field-wrapper [field]="chamadoForm.movelRelacionado!()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>
                {{ requerTombamento() ? 'Nº do Tombo / Patrimônio (Obrigatório)' : 'Nº do Tombo / Patrimônio (Opcional)' }}
              </mat-label>
              <input
                matInput
                [formField]="chamadoForm.movelRelacionado"
                placeholder="Ex: 15131104 ou TOMBO-2024"
              />
              @if (requerTombamento()) {
                <span matSuffix class="text-xs font-bold text-amber-600 mr-2">*Exigido</span>
              }
            </mat-form-field>
          </app-field-wrapper>

          <!-- Número da Requisição e-Cidade -->
          <app-field-wrapper [field]="chamadoForm.numeroRequisicaoEcidade!()">
            <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
              <mat-label>Nº Protocolo e-Cidade (Opcional)</mat-label>
              <input
                matInput
                [formField]="chamadoForm.numeroRequisicaoEcidade"
                placeholder="Ex: 002359/2026"
              />
            </mat-form-field>
          </app-field-wrapper>
        </div>

        <!-- ========================================== -->
        <!-- SEÇÃO 4: DETALHAMENTO DA DEMANDA           -->
        <!-- ========================================== -->
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

    <!-- Rodapé de Ações -->
    <mat-dialog-actions align="end" class="!px-6 !py-3 bg-gray-50 !border-t !border-gray-300">
      <button mat-button mat-dialog-close class="!rounded-3xl">Cancelar</button>
      <button
        mat-flat-button
        class="disabled:!bg-gray-200 disabled:!text-gray-400 !rounded-3xl !bg-blue-600 !text-white"
        [disabled]="isFormularioInvalido()"
        (click)="salvar()"
      >
        Abrir Chamado
      </button>
    </mat-dialog-actions>
  `
})
export class ChamadoFormComponent implements OnInit {
  protected readonly store = inject(ManutencaoStore);
  private readonly dialogRef = inject(MatDialogRef<ChamadoFormComponent>);

  readonly chamadoForm = form(formAberturaChamado, aberturaChamadoSchema);

  readonly listaPrioridades: PrioridadeChamado[] = Object.values(PrioridadeChamado) as PrioridadeChamado[];
  readonly rotulosPrioridade = PRIORIDADE_CHAMADO_LABELS;

  // Data mínima para o seletor HTML date: "YYYY-MM-DD" atual
  readonly minDataHoje = new Date().toISOString().split('T')[0];

  /**
   * Identifica se a subcategoria atualmente selecionada exige tombo/patrimônio
   */
  readonly subcategoriaSelecionada = computed(() => {
    const subId = this.chamadoForm.subcategoriaId().value();

    if (!subId) return null;

    return this.store.subcategoriasAtivas().find((s) => s.id === subId) ?? null;
  });

  readonly requerTombamento = computed(() => {
    return this.subcategoriaSelecionada()?.requerTombamento ?? false;
  });

  // Computed que adiciona o item fixo "Outro local" à lista de salas da Store:
  readonly salasComOpcaoOutro = computed(() => {
    const salas = this.store.salasPorAndar();
    return [
      ...salas,
      { id: 30, numeroIdentificacao: 'Outro local', andar: null, rotuloAndar: '', ativo: true }
    ];
  });

  ngOnInit() {
    this.store.loadAndares();
    this.store.loadCategoriasAtivas();
    this.store.loadSalasPorAndar(AndarCodigo.TERREO);

    // Limpa os dados do formulário após salvar
    formAberturaChamado.set({ ...initialAberturaChamado });
  }

  onAndarChange(andar: AndarCodigo) {
    if (andar) {
      this.store.loadSalasPorAndar(andar);
    }
  }

  /**
   * 1º Passo da Cascata: Categoria alterada
   * Limpa subcategoria e tipo de serviço; carrega subcategorias da categoria selecionada.
   */
  onCategoriaChange(categoriaId: number | null) {
    this.chamadoForm.subcategoriaId().value.set(null);
    this.chamadoForm.tipoServicoId().value.set(null);

    if (categoriaId) {
      this.store.loadSubcategoriasAtivasPorCategoria(categoriaId);
    }
  }

  /**
   * 2º Passo da Cascata: Subcategoria alterada
   * Limpa tipo de serviço; carrega tipos de serviço da subcategoria selecionada.
   */
  onSubcategoriaChange(subcategoriaId: number | null) {
    this.chamadoForm.tipoServicoId().value.set(null);

    if (subcategoriaId) {
      this.store.loadTiposAtivosPorSubCategoria(subcategoriaId);
    }
  }

  /**
   * Valida se o formulário está apto para submissão (incluindo regra de tombamento dinâmico)
   */
  isFormularioInvalido(): boolean {
    if (this.chamadoForm().invalid()) {
      return true;
    }
    // Se a subcategoria exigir tombo, valida se foi informado
    if (this.requerTombamento()) {
      const tombo = this.chamadoForm.movelRelacionado?.().value();

      if (!tombo || tombo.trim().length === 0) {
        return true;
      }
    }
    return false;
  }

  getPrioridadeClass(prioridade: PrioridadeChamado): string {
    switch (prioridade) {
      case PrioridadeChamado.BAIXA:
        return 'text-gray-600 font-medium';
      case PrioridadeChamado.MEDIA:
        return 'text-blue-700 font-medium';
      case PrioridadeChamado.ALTA:
        return 'text-amber-700 font-bold';
      case PrioridadeChamado.URGENTE:
        return 'text-red-700 font-extrabold';
    }
  }

  async salvar() {
    await submit(this.chamadoForm, async (formValues) => {
      this.store.abrirChamado({
        payload: formValues().value(),
        onSuccess: () => {
          this.dialogRef.close(true);
        }
      });
    });
  }
}
