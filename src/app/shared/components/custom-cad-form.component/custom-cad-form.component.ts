import { Component, input, output, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { CargoRequestDTO, SaveRequest } from '../../../core/models/cargo.model';
import { BaseEntityDTO } from '../../../core/models/servidor.model';

@Component({
  selector: 'app-custom-cad-form',
  imports: [
    FormField,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
  ],
  standalone: true,
  template: `
    <div
      class="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-2 md:p-4 max-w-5xl mx-auto"
    >
      <h2 class="text-2xl font-bold text-gray-800">Gestão de {{ title() }}</h2>
      <p class="text-sm text-gray-500 mb-2">Gerencie os {{ title() }}s do sistema</p>

      <div
        class="flex flex-col md:flex-row gap-4 items-start md:items-start
               bg-gray-50 p-5 rounded-xl border border-gray-200"
      >
        <div class="flex flex-col w-full md:flex-1">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Novo {{ title() }}</mat-label>
            <input matInput [formField]="customForm.nome" placeholder="Digite o nome..." />
          </mat-form-field>
          @if (customForm.nome().invalid() && customForm.nome().touched()) {
            @for (error of customForm.nome().errors(); track error) {
              <mat-error class="pl-3 text-sm">{{ error.message }}</mat-error>
            }
          }
        </div>

        <div class="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
          <button
            mat-stroked-button
            class="flex-1 md:flex-none h-[48px] text-gray-600"
            (click)="cancelEdit()"
          >
            <mat-icon>close</mat-icon>
            Cancelar
          </button>
          <button
            mat-flat-button
            [disabled]="customForm().invalid()"
            color="primary"
            class="flex-1 md:flex-none h-[48px]"
            (click)="emitSave()"
          >
            <mat-icon>save</mat-icon>
            {{ isEdit() ? 'Atualizar' : 'Salvar' }}
          </button>
        </div>
      </div>

      <hr class="border-gray-300 mb-4" />

      <div class="mb-4 flex items-center justify-between">
        <mat-form-field appearance="outline" class="w-full md:w-96" subscriptSizing="dynamic">
          <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
          <mat-label>Pesquisar</mat-label>
          <input matInput placeholder="Buscar por nome..." />
        </mat-form-field>
      </div>

      <div class="max-h-[280px] overflow-y-auto rounded-xl border border-gray-200">
        <table mat-table [dataSource]="data()" class="w-full">
          <ng-container matColumnDef="id">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap"
            >
              ID
            </th>
            <td
              mat-cell
              *matCellDef="let element"
              class="!text-sm !px-3 whitespace-nowrap text-gray-600"
            >
              {{ element.id }}
            </td>
          </ng-container>

          <ng-container matColumnDef="nome">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold text-gray-800 !text-sm !px-3"
            >
              Nome
            </th>
            <td
              mat-cell
              *matCellDef="let element"
              class="!font-medium !text-sm !px-3 text-gray-600"
            >
              {{ element.nome }}
            </td>
          </ng-container>

          <ng-container matColumnDef="acoes">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!text-center !text-sm !px-3 !w-[1%] whitespace-nowrap"
            >
              Ações
            </th>
            <td
              mat-cell
              *matCellDef="let element"
              class="!text-sm !px-3 text-gray-600 whitespace-nowrap"
            >
              <button
                mat-icon-button
                class="group !w-8 !h-8 !leading-none"
                matTooltip="Editar"
                (click)="preparedEdit(element)"
              >
                <mat-icon
                  class="!text-blue-600 transition-transform duration-200
                        group-hover:!scale-125 !text-[20px]"
                >
                  edit
                </mat-icon>
              </button>
              <button
                mat-icon-button
                class="group !w-8 !h-8 !leading-none"
                matTooltip="Excluir"
                (click)="emitDelete(element.id)"
              >
                <mat-icon
                  class="!text-red-600 transition-transform duration-200
                         group-hover:!scale-125 !text-[20px]"
                  >delete
                </mat-icon>
              </button>
            </td>
          </ng-container>

          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns; sticky: true"
            class="!min-h-[30px] !h-[30px] !bg-gray-100 border-b-2 border-gray-300 z-10"
          ></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="!min-h-[30px] !h-[30px]
            odd:!bg-white even:!bg-gray-50
            hover:!bg-blue-50 transition-colors cursor-pointer border-gray-100"
          ></tr>
          <tr class="mat-row" *matNoDataRow>
            <td
              class="mat-cell p-4 text-center text-red-800 text-xl"
              [colSpan]="displayedColumns.length"
            >
              Nenhum servidor encontrado.
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
})
export class CustomCadFormComponent {
  // Reutilização: O título vem de quem chamar o componente!
  title = input.required<string>();
  data = input.required<BaseEntityDTO[]>();

  onSave = output<SaveRequest>();
  onDelete = output<number>();
  isEdit = signal<number | null>(null);

  // Inicializa o modelo de dados para o formulário
  customModel = signal<CargoRequestDTO>({
    nome: '',
    email: '',
    descricao: '',
  });

  // cria o forulário e suas validações
  customForm = form(this.customModel, (path) => {
    // validações para o campo Nome
    required(path.nome!, { message: 'O nome é obrigatório' });
    minLength(path.nome!, 5, { message: 'O Nome deve ter no mínimo 5 caracteres' });
    maxLength(path.nome!, 150, {
      message: 'O nome deve ter no máximo 150 caracteres',
    });
  });
  // Apenas para renderizar a tabela visualmente (removeremos na fase de lógica)
  displayedColumns: string[] = ['id', 'nome', 'acoes'];

  //
  preparedEdit(element: BaseEntityDTO) {
    this.isEdit.set(element.id);

    // Atualiza o valor do Signal Form com os dados de element
    this.customModel.update((m) => ({
      ...m,
      nome: element.nome,
      email: element.email || '',
      descricao: element.descricao || '',
    }));
  }

  // cancela a edição - Atualiza o Signal Form limpando dados
  cancelEdit() {
    this.isEdit.set(null);
    this.customModel.update((m) => ({
      ...m,
      nome: '',
      descricao: '',
      email: '',
    }));
    this.customForm().reset(); // Limpa os campos do fomulário
  }

  // emite os dados do formulário para o componente pai
  async emitSave() {
    await submit(this.customForm, async () => {
      this.onSave.emit({
        id: this.isEdit() ?? undefined,
        payload: this.customModel(),
      });
      this.cancelEdit();
    });
  }

  // emite o ID do registro que será excluído para o componente pai
  emitDelete(id: number) {
    this.onDelete.emit(id);
  }
}
