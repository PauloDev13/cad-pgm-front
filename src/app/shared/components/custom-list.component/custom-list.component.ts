import { Component, input, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { CargoResponseDTO } from '../../../core/models/cargo.model';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-cargo-custom-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginator,
  ],
  standalone: true,
  template: `
    <div
      class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 max-w-5xl mx-auto mt-4"
    >
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 leading-tight">Gestão de {{ title() }}</h2>
        <p class="text-sm text-gray-500">Gerencie os {{ title() }}s do sistema</p>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <mat-form-field appearance="outline" class="w-full md:w-96" subscriptSizing="dynamic">
          <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
          <mat-label>Pesquisar {{ title() | lowercase }}...</mat-label>
          <input matInput (input)="searchInput($event)" (keyup.enter)="pesquisar()" />
        </mat-form-field>
        <button
          mat-flat-button
          class="!bg-blue-500
          !transition-transform
          duration-300
          !ease-in-out
          hover:!scale-105"
          (click)="onAdd.emit()"
        >
          <mat-icon>add</mat-icon>
          Novo
        </button>
      </div>

      <div class="overflow-y-auto rounded-xl border border-gray-200" style="max-height: 480px;">
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
                (click)="onEdit.emit(element)"
              >
                <mat-icon
                  class="!text-blue-600 transition-transform duration-200 group-hover:!scale-125 !text-[20px]"
                >
                  edit
                </mat-icon>
              </button>

              <button
                mat-icon-button
                class="group !w-8 !h-8 !leading-none"
                matTooltip="Excluir"
                (click)="onDelete.emit(element.id)"
              >
                <mat-icon
                  class="!text-red-600 transition-transform duration-200 group-hover:!scale-125 !text-[20px]"
                >
                  delete
                </mat-icon>
              </button>
            </td>
          </ng-container>

          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns; sticky: true"
            class="!min-h-[40px] !h-[40px] !bg-gray-100 border-b-2 border-gray-300 !z-10"
          ></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="!min-h-[40px] !h-[40px] odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50 transition-colors border-gray-100"
          ></tr>

          <tr class="mat-row" *matNoDataRow>
            <td
              class="mat-cell p-4 text-center text-red-800 text-xl"
              [colSpan]="displayedColumns.length"
            >
              Nenhum registro encontrado.
            </td>
          </tr>
        </table>
        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageIndex]="currentPage()"
          [pageSizeOptions]="[6, 10, 25]"
          (page)="pageChange($event)"
          aria-label="Selecione a página"
        >
        </mat-paginator>
      </div>
    </div>
  `,
  styles: ``,
})
export class CustomListComponent {
  // recebe o título e os dados
  title = input.required<string>();
  data = input.required<CargoResponseDTO[]>();

  // signals de paginação
  totalElements = input.required<number>();
  pageSize = input<number>();
  currentPage = input<number>();

  //Avisa o pai que a página ou o tamanho mudaram
  onPageChange = output<PageEvent>();

  onSearchInput = output<string>();
  realizarPesquisa = output<void>();

  // EVENTOS QUE SERÃO DISPARADOS PARA O COMPONENTE PAIi
  // Emitimos vazio, o Pai sabe que é para abrir o Dialog vazio
  onAdd = output<void>();
  // Emitimos o objeto inteiro para o Pai preencher o Dialog
  onEdit = output<any>();
  // Emitimos o ID para o Pai chamar a API de Delete
  onDelete = output<number>();

  displayedColumns: string[] = ['id', 'nome', 'acoes'];

  searchInput(event: Event) {
    let value = (event.target as HTMLInputElement).value;
    this.onSearchInput.emit(value);
  }

  pesquisar() {
    this.realizarPesquisa.emit();
  }

  pageChange(pageEvent: PageEvent) {
    this.onPageChange.emit(pageEvent);
  }
}
