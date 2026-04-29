import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingComponent } from '../loading.component/loading.component';

@Component({
  selector: 'app-custom-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginator,
    MatProgressSpinnerModule,
    LoadingComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-gray-50 shadow-md rounded-2xl border border-gray-200 p-4 md:p-6 max-w-5xl mx-auto mt-4 w-full"
    >
      <div class="mb-6">
        <h2 class="text-xl md:text-2xl font-bold text-blue-800 leading-tight">Gestão de {{ title() }}</h2>
        <p class="text-sm text-gray-500 mt-1">Gerencie os {{ title() }}s do sistema</p>
      </div>

      <div
        class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4
              bg-white sm:bg-gray-100 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200"
      >
        <mat-form-field
          appearance="outline"
          class="w-full sm:flex-1 md:max-w-md"
          subscriptSizing="dynamic"
        >
          <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
          <mat-label>Pesquisar {{ title() | lowercase }}...</mat-label>
          <input
            matInput
            (input)="searchInput($event)"
            placeholder="Digite pelo menos 3 letras..."
          />
        </mat-form-field>
        <button
          mat-flat-button
          class="w-full sm:w-auto !bg-blue-600 !text-white !transition-transform duration-300
                !ease-in-out hover:!scale-105 flex justify-center items-center !h-12 sm:!h-10"
          (click)="onAdd.emit()"
        >
          <mat-icon class="mr-1">add</mat-icon>
          Novo
        </button>
      </div>

      <div
        class="shadow-sm rounded-xl border border-gray-200 overflow-hidden bg-white relative
              flex flex-col w-full"
      >
        <!-- Chama o componente de loading-->
        <app-loading [isLoading]="isLoading()" />

        <div class="overflow-auto w-full" style="max-height: 500px;">
          <table mat-table [dataSource]="data()" class="w-full min-w-full">
            <ng-container matColumnDef="id">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="hidden sm:table-cell !font-semibold text-gray-800 !text-sm !px-3 !w-[1%]
                      whitespace-nowrap"
              >
                ID
              </th>
              <td
                mat-cell
                *matCellDef="let element"
                class="hidden sm:table-cell !text-sm !px-3 whitespace-nowrap text-gray-600"
              >
                {{ element.id }}
              </td>
            </ng-container>

            <ng-container matColumnDef="main">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!font-semibold text-gray-800 !text-sm !px-3"
              >
                {{ mainColumnLabel() }}
              </th>
              <td
                mat-cell
                *matCellDef="let element"
                class="!font-medium !text-sm !px-3 text-gray-600 truncate max-w-[150px] sm:max-w-none"
              >
                {{ element[mainColumnKey()] }}
              </td>
            </ng-container>

            <ng-container matColumnDef="acoes">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!text-center !font-semibold !text-sm !px-2 sm:!px-3 !w-[1%] whitespace-nowrap"
              >
                Ações
              </th>
              <td
                mat-cell
                *matCellDef="let element"
                class="!text-sm !px-2 sm:!px-3 text-gray-600 whitespace-nowrap text-right"
              >
                <button
                  mat-icon-button
                  class="group !w-10 !h-10 sm:!w-8 sm:!h-8 !leading-none mr-1 sm:mr-2 flex
                        justify-center items-center"
                  matTooltip="Editar"
                  (click)="onEdit.emit(element)"
                >
                  <mat-icon
                    class="!text-blue-600 transition-transform duration-200 group-hover:!scale-125
                          !text-[20px]"
                  >
                    edit
                  </mat-icon>
                </button>

                <button
                  mat-icon-button
                  class="group !w-10 !h-10 sm:!w-8 sm:!h-8 !leading-none flex justify-center
                        items-center"
                  matTooltip="Excluir"
                  (click)="onDelete.emit(element.id)"
                >
                  <mat-icon
                    class="!text-red-600 transition-transform duration-200 group-hover:!scale-125
                          !text-[20px]"
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
              class="!min-h-[40px] !h-[40px] odd:!bg-white even:!bg-gray-50 hover:!bg-blue-50
                    transition-colors border-gray-100"
            ></tr>

            <tr class="mat-row" *matNoDataRow>
              <td
                class="mat-cell p-4 text-center text-red-800 text-base md:text-xl"
                [colSpan]="displayedColumns.length"
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          </table>
        </div>
        <mat-paginator
          class="!bg-gray-100"
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageIndex]="currentPage()"
          [pageSizeOptions]="[10, 15, 20]"
          [showFirstLastButtons]="true"
          (page)="pageChange($event)"
          aria-label="Selecione a página"
        >
        </mat-paginator>
      </div>
    </div>
  `
})
export class CustomListComponent implements OnInit {
  // Inputs Signals de recebimento de dados (título e
  title = input.required<string>();
  data = input.required<any[]>();

  // Novos Inputs para tornar a coluna dinâmica (Com valores padrão para não quebrar o que já existe)
  mainColumnKey = input<string>('nome'); // Qual atributo ler do objeto? (ex: 'nome', 'descricao')
  mainColumnLabel = input<string>('Nome'); // Qual o título da coluna? (ex: 'Nome', 'Descrição')

  // Inputs signals de paginação
  totalElements = input.required<number>();
  pageSize = input<number>();
  currentPage = input<number>();

  isLoading = input<boolean>(false);

  //Avisa o pai que a página ou o tamanho mudaram
  onPageChange = output<PageEvent>();
  // EVENTOS QUE SERÃO DISPARADOS PARA O COMPONENTE PAIi
  onSearch = output<string>();
  // Emitimos vazio, o Pai sabe que é para abrir o Dialog vazio
  onAdd = output<void>();
  // Emitimos o objeto inteiro para o Pai preencher o Dialog
  onEdit = output<any>();
  // Emitimos o ID para o Pai chamar a API de Delete
  onDelete = output<number>();

  displayedColumns: string[] = ['id', 'main', 'acoes'];

  // O Funil do RxJS fica escondido aqui no componente genérico
  private searchSubject = new Subject<string>();
  // O Angular nos dá uma referência da destruição deste componente
  private destroyRef = inject(DestroyRef);

  searchInput(event: any) {
    let value = (event.target as HTMLInputElement).value;

    // Joga o que o usuário digita no funil
    this.searchSubject.next(value);
  }

  pageChange(pageEvent: PageEvent) {
    this.onPageChange.emit(pageEvent);
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        // Dizemos pro fluxo morrer com o componente
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((termo) => {
        //Se existirem, limpa os espaços vazios do conteúdo informado para pesquisa
        const termoLimpo = termo.trim();

        // Regra de Ouro: Só emite para o Pai se apagou tudo OU se tem 3+ letras
        if (termoLimpo === '' || termoLimpo.length >= 3) {
          this.onSearch.emit(termoLimpo);
        }
      });
  }
}
