import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ServidorService } from '../../../core/services/servidor.service';
import { BaseEntityDTO, ServidorResponseDTO } from '../../../core/models/servidor.model';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CadFormComponent } from '../form/cad-form.component';
import { DominioService } from '../../../core/services/dominio.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { PageResponse } from '../../../core/models/pagination.model';
import { ToastService } from '../../../core/services/toast.service';
import { CustomDeleteService } from '../../../shared/service/custom-delete.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-servidor-list',
  standalone: true,
  template: `
    <div class="bg-gray-50 shadow rounded-2xl border border-gray-200 p-4 md:p-6  mx-auto mt-4">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Gestão de Servidores</h1>
          <p class="text-sm text-gray-500">Gerencie os servidores do sistema</p>
        </div>
        <button
          mat-flat-button
          class="!bg-blue-500
          !transition-transform
          duration-300
          !ease-in-out
          hover:!scale-105"
          (click)="openForm()"
        >
          <mat-icon>add</mat-icon>
          Novo
        </button>
      </div>

      <div
        class="flex flex-col md:flex-row justify-between items-end gap-4 mb-6
        bg-gray-50 p-4 rounded-lg shadow-sm shadow-gray-300 border border-gray-300"
      >
        <div class="w-full md:w-64 bg-white">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
            <mat-label>Filtrar por Status</mat-label>
            <mat-select
              [value]="selectedStatusId()"
              (selectionChange)="onStatusChange($event.value)"
            >
              <mat-option [value]="null">Todos os Status</mat-option>
              @for (status of statusList(); track status.id) {
                <mat-option [value]="status.id">{{ status.descricao }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="flex flex-col md:flex-row gap-2 flex-1 w-full md:justify-end bg-white">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-32">
            <mat-label>Filtrar por Nome/CPF/Matrícula</mat-label>
            <mat-select [value]="searchType()" (selectionChange)="onSearchTypeChange($event.value)">
              <mat-option value="NOME">NOME</mat-option>
              <mat-option value="CPF">CPF</mat-option>
              <mat-option value="MATRICULA">MATRÍCULA</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field
            appearance="outline"
            subscriptSizing="dynamic"
            class="w-full md:w-96 lg:w-[450px]"
          >
            <mat-label>Digite para buscar...</mat-label>
            <input
              matInput
              [value]="searchTerm()"
              (input)="onSearchInput($event)"
              placeholder="{{
                searchType() === 'CPF'
                  ? 'Apenas dígitos numéricos'
                  : searchType() === 'NOME'
                    ? 'Ex: João Morais'
                    : 'Ex: T0001 ou 01031'
              }}"
            />
            <mat-icon matIconPrefix class="text-gray-500">search</mat-icon>
          </mat-form-field>
        </div>
      </div>

      <div class="border border-gray-300 rounded-lg drop-shadow-md overflow-hidden">
        @if (isLoading()) {
          <div
            class="absolute inset-0 z-50 flex flex-col items-center
                      justify-center bg-white/80 backdrop-blur-sm"
          >
            <mat-spinner diameter="50" color="primary"></mat-spinner>
            <span class="mt-4 text-sm font-semibold text-blue-600 tracking-wider animate-pulse">
              CARREGANDO...
            </span>
          </div>
        }
        <table mat-table [dataSource]="servidores()" class="w-full">
          <ng-container matColumnDef="matricula">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold text-gray-800 !text-sm !px-3 !w-[1%] whitespace-nowrap"
            >
              Matrícula
            </th>
            <td mat-cell *matCellDef="let s" class="!text-sm !px-3 whitespace-nowrap text-gray-600">
              {{ s.matricula }}
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
            <td mat-cell *matCellDef="let s" class="!font-medium !text-sm !px-3 text-gray-600">
              {{ s.nome }}
            </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold !text-gray-800 !text-sm !px-3"
            >
              Email
            </th>
            <td mat-cell *matCellDef="let s" class="!text-sm !px-3 text-gray-600">
              {{ s.emailPessoal }}
            </td>
          </ng-container>

          <ng-container matColumnDef="cargo">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="font-semibold text-gray-800 !text-sm !px-3"
            >
              Cargo
            </th>
            <td mat-cell *matCellDef="let s" class="!text-sm !px-3 text-gray-600">
              {{ s.cargo?.nome || '-' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="setor">
            <th
              mat-header-cell
              *matHeaderCellDef
              class="!font-semibold text-gray-800 !text-sm !px-3"
            >
              Setor
            </th>
            <td mat-cell *matCellDef="let s" class="!text-sm !px-3 text-gray-600">
              {{ s.setor?.nome || '-' }}
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
            <td mat-cell *matCellDef="let s" class="!text-sm !px-3 text-gray-600 whitespace-nowrap">
              <button
                mat-icon-button
                (click)="openForm(s)"
                matTooltip="Editar"
                class="group !w-8 !h-8 !leading-none"
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
                (click)="delete(s.id)"
                matTooltip="Excluir"
                class="group !w-8 !h-8 !leading-none"
              >
                <mat-icon
                  class="!text-red-600 transition-transform duration-200 g
                  roup-hover:!scale-125 !text-[20px]"
                >
                  delete
                </mat-icon>
              </button>
            </td>
          </ng-container>

          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns"
            class="!min-h-[40px] !h-[40px] !bg-gray-50 border-b-2 border-gray-300"
          ></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="!min-h-[40px] !h-[40px]
            odd:!bg-white even:!bg-gray-50
            hover:!bg-blue-50 transition-colors cursor-pointer border-gray-100"
          ></tr>

          <tr class="mat-row" *matNoDataRow>
            <td
              class="mat-cell p-4 text-center text-red-800 text-xl"
              [colSpan]="displayedColumns.length"
            >
              {{ 'Nenhum servidor encontrado.' }}
            </td>
          </tr>
        </table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageIndex]="currentPage()"
          [pageSizeOptions]="[10, 15, 20]"
          (page)="onPageChange($event)"
          aria-label="Selecione a página"
        >
        </mat-paginator>
      </div>
    </div>
  `,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export default class ServidorListComponent implements OnInit {
  //Signals para Estado
  servidores = signal<ServidorResponseDTO[]>([]);
  totalElements = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  isLoading = signal<boolean>(false);
  displayedColumns: string[] = ['matricula', 'nome', 'email', 'setor', 'cargo', 'acoes'];

  //Lista de status vinda da API
  statusList = signal<BaseEntityDTO[]>([]);

  // Estado do formulário de busca no HTML
  selectedStatusId = signal<number | null>(null);
  searchType = signal<'CPF' | 'MATRICULA' | 'NOME'>('NOME');
  searchTerm = signal<string>('');

  //O funil de eventos de digitação
  private searchSubject = new Subject<string>();
  // O Angular nos dá uma referência da destruição deste componente
  private destroyRef = inject(DestroyRef);

  // Injeções
  private readonly servidorService = inject(ServidorService);
  private readonly dominioService = inject(DominioService);
  private readonly toastService = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly customDeleteService = inject(CustomDeleteService);

  ngOnInit(): void {
    this.carregarFiltrosIniciais();
    this.configurarDebounceDePesquisa(); // Inicializa o nosso escutador
  }

  // centralizador: Decide qual endpoint chamar com base nos filtros
  loadData() {
    this.isLoading.set(true);

    const page = this.currentPage();
    const size = this.pageSize();

    // Captura os valores atuais dos signals de filtro
    const statusId = this.selectedStatusId();
    const termo = this.searchTerm();
    const tipo = this.searchType();

    // Regra de Negócio: Se tem algum filtro preenchido, usamos o novo endpoint
    const temFiltroAtivo = statusId !== null || (termo && termo.trim() !== '');

    if (temFiltroAtivo) {
      // Mapeia o termo de pesquisa para o parâmetro correto
      const cpf = tipo === 'CPF' && termo ? termo : undefined;
      const matricula = tipo === 'MATRICULA' && termo ? termo : undefined;
      const nome = tipo === 'NOME' && termo ? termo : undefined;

      // Chama o NOVO ENDPOINT no Service (searchFilter)
      this.servidorService.searchFilter(page, size, statusId, cpf, matricula, nome).subscribe({
        next: (pageData) => {
          this.setPageData(pageData);
          // this.totalElements.set(pageData.page.totalElements);
        },
        error: () => this.toastService.error('Erro ao filtrar dados'),
        complete: () => this.isLoading.set(false),
      });
    } else {
      // Chama o ENDPOINT ORIGINAL (findAll) - Listagem limpa
      this.servidorService.findAll(page, size).subscribe({
        next: (pageData) => this.setPageData(pageData),
        error: () => this.toastService.error('Erro ao carregar dados'),
        complete: () => this.isLoading.set(false),
      });
    }
  }

  openForm(servidor?: ServidorResponseDTO) {
    const dialogRef = this.dialog.open(CadFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vw',
      data: servidor,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData(); // Recarrega se houve alteração
      }
    });
  }

  delete(id: number) {
    this.customDeleteService.execute(
      () => this.servidorService.delete(id),
      () => this.loadData(),
      {
        successMsg: 'Servidor removido com sucesso!',
      },
    );
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  // É o chamado pelo HTML quando o usuário troca o Status
  onStatusChange(id: number | null) {
    this.selectedStatusId.set(id);
    // Limpa o input de texto (CPF/Matrícula)
    this.searchTerm.set('');
    this.currentPage.set(0); // Reseta para a primeira página
    this.loadData(); //Dispara a busca limpa no backend
  }

  // É chamado pelo HTML quando o usuário digita no campo de busca
  // ALTERAÇÃO: O HTML não atualiza mais o Signal direto, ele alimenta o Subject
  onSearchInput(event: Event) {
    let value = (event.target as HTMLInputElement).value;

    // Regra de Validação: Se for CPF, remove tudo que não for número e limita a 11 dítigos
    if (this.searchType() === 'CPF') {
      value = value.replace(/\D/g, '').substring(0, 11);
      (event.target as HTMLInputElement).value = value; // Reflete a mudança no input HTML
    }

    // Joga o valor digitado no "funil" do RxJS.
    // O subscribe ali em cima vai decidir quando disparar a busca.
    this.searchSubject.next(value);
  }

  // É chamado quando o usuário troca entre Nome, CPF ou Matrícula
  onSearchTypeChange(newType: 'CPF' | 'MATRICULA' | 'NOME') {
    this.searchType.set(newType);
    this.searchTerm.set(''); // Limpa a memória oficial

    // Esvazia o "funil" do RxJS para garantir que nenhuma busca fantasma aconteça
    this.searchSubject.next('');

    this.currentPage.set(0); // Volta pra página 1
    this.loadData(); //Recarrega a tabela mostrando todos os registros novamente!
  }

  //  NOVO MÉTODO PARA BUSCA DINÂMICA
  private configurarDebounceDePesquisa() {
    this.searchSubject
      .pipe(
        debounceTime(500), // Espera o usuário parar de digitar por 500ms
        distinctUntilChanged(), // Só continua se a palavra final for diferente da última busca
        takeUntilDestroyed(this.destroyRef), // Dizemos pro fluxo morrer com o componente
      )
      .subscribe((termoDigitado) => {
        // Se o usuário apagou tudo (Cenário 1)
        if (termoDigitado.trim() === '') {
          this.selectedStatusId.set(null); // Volta para "Todos os Status"
          this.searchTerm.set(''); // Limpa o termo no Signal
          this.currentPage.set(0); // Volta pra página 1
          this.loadData(); // Recarrega a tabela completa!
          return;
        }

        //  Só busca se tiver 3 caracteres ou mais (Cenário 2)
        if (termoDigitado.trim().length >= 3) {
          this.searchTerm.set(termoDigitado.trim());
          this.currentPage.set(0);
          this.loadData();
        }
      });
  }

  // Helper para centralizar a atualização dos signals da tabela
  private setPageData(response: PageResponse<any>) {
    this.servidores.set(response.content);
    this.totalElements.set(response.page.totalElements);
    this.currentPage.set(response.page.number);
  }

  // Busca a lista de Status e cumpre o requisito de UX de iniciar com "Ativos"
  private carregarFiltrosIniciais() {
    this.dominioService.getStatus().subscribe({
      next: (statusData) => {
        this.statusList.set(statusData);

        // Tenta encontrar dinamicamente o ID do status "Ativo"
        const ativo = statusData.find((s) => (s.descricao || s.nome)?.toLowerCase() === 'ativo');

        if (ativo) {
          this.selectedStatusId.set(ativo.id); // Seta Ativo como padrão
        }

        // Após configurar o status padrão, chamamos a listagem inicial
        this.loadData();
      },
      error: () => this.toastService.error('Erro ao carregar lista de status'),
    });
  }
}
