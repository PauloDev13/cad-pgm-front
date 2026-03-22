import { Component, inject, OnInit, signal } from '@angular/core';
import { ServidorService } from '../../../core/services/servidor.service';
import { BaseEntityDTO, ServidorResponseDTO } from '../../../core/models/servidor.model';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CadFormComponent } from '../form/cad-form.component';
import { DominioService } from '../../../core/services/dominio.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-servidor-list',
  standalone: true,
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Gestão de Servidores</h1>
          <p class="text-sm text-gray-500">Gerencie os servidores do sistema</p>
        </div>
        <button
          mat-flat-button
          class="!bg-blue-500 transition-transform duration-200 hover:!scale-105 "
          (click)="openForm()"
        >
          <mat-icon>add</mat-icon>
          Novo
        </button>
      </div>

      <div
        class="flex flex-col md:flex-row justify-between items-end gap-4 mb-6
        bg-gray-100 p-4 rounded-lg shadow-sm shadow-gray-500 border border-gray-100"
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
            <mat-label>Filtrar por Nome ou CPF ou Matrícula</mat-label>
            <mat-select
              [value]="searchType()"
              (selectionChange)="searchType.set($event.value); searchTerm.set('')"
            >
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
              (keyup.enter)="realizarPesquisa()"
              placeholder="{{
                searchType() === 'CPF'
                  ? 'Apenas dígitos numéricos'
                  : searchType() === 'NOME'
                    ? 'Ex: João Morais'
                    : 'Ex: T0001 ou 01031'
              }}"
            />

            <button
              mat-icon-button
              matSuffix
              (click)="realizarPesquisa()"
              color="primary"
              aria-label="Pesquisar"
            >
              <mat-icon>search</mat-icon>
            </button>
          </mat-form-field>
        </div>
      </div>

      <div class="bg-black rounded-lg drop-shadow-md overflow-hidden">
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

          <!--          <ng-container matColumnDef="vinculo">-->
          <!--            <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-700">Vínculo</th>-->
          <!--            <td mat-cell *matCellDef="let s">{{ s.vinculo?.nome || '-' }}</td>-->
          <!--          </ng-container>-->

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
                  class="!text-blue-600 transition-transform duration-200 group-hover:!scale-125 !text-[20px]"
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
                  class="!text-red-600 transition-transform duration-200 group-hover:!scale-125 !text-[20px]"
                >
                  delete
                </mat-icon>
              </button>
            </td>
          </ng-container>

          <tr
            mat-header-row
            *matHeaderRowDef="displayedColumns"
            class="!min-h-[40px] !h-[40px] !bg-gray-100 border-b-2 border-gray-300"
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
              {{ isLoading() ? 'Carregando servidores...' : 'Nenhum servidor encontrado.' }}
            </td>
          </tr>
        </table>

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[5, 10, 25, 100]"
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
  // displayedColumns: string[] = ['matricula', 'nome', 'email', 'cargo', 'setor', 'vinculo', 'acoes'];

  // NOVOS SIGNALS PARA ESTADO DOS FILTROS

  //Lista de status vinda da API
  statusList = signal<BaseEntityDTO[]>([]);

  // Estado do formulário de busca no HTML
  selectedStatusId = signal<number | null>(null);
  searchType = signal<'CPF' | 'MATRICULA' | 'NOME'>('NOME');
  searchTerm = signal<string>('');

  // Injeções
  private readonly servidorService = inject(ServidorService);
  private readonly dominioService = inject(DominioService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    // this.loadData();
    this.carregarFiltrosIniciais();
  }

  // Método centralizador: Decide qual endpoint chamar com base nos filtros
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
        next: (pageData) => this.setPageData(pageData),
        error: () => this.showMessage('Erro ao filtrar servidores'),
        complete: () => this.isLoading.set(false),
      });
    } else {
      // Chama o ENDPOINT ORIGINAL (findAll) - Listagem limpa
      this.servidorService.findAll(page, size).subscribe({
        next: (pageData) => this.setPageData(pageData),
        error: () => this.showMessage('Erro ao carregar servidores'),
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
    if (confirm('Tem certeza que deseja remover este servidor?')) {
      this.servidorService.delete(id).subscribe({
        next: () => {
          this.showMessage('Servidor removido com sucesso!');
          this.loadData();
        },
        error: () => this.showMessage('Erro ao remover servidor'),
      });
    }
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  // Método chamado pelo HTML quando o usuário troca o Status
  onStatusChange(id: number | null) {
    this.selectedStatusId.set(id);
    // Limpa o input de texto (CPF/Matrícula)
    this.searchTerm.set('');
    this.currentPage.set(0); // Reseta para a primeira página
    this.loadData(); //Dispara a busca limpa no backend
  }

  // Método chamado pelo HTML quando o usuário digita no campo de busca
  onSearchInput(event: Event) {
    let value = (event.target as HTMLInputElement).value;

    // Regra de Validação: Se for CPF, remove tudo que não for número e limita a 11 dítigos
    if (this.searchType() === 'CPF') {
      value = value.replace(/\D/g, '').substring(0, 11);
      (event.target as HTMLInputElement).value = value; // Reflete a mudança no input HTML
    }

    this.searchTerm.set(value);
  }

  // Método chamado quando o usuário clica na lupa ou aperta Enter
  realizarPesquisa() {
    this.currentPage.set(0); // Reseta a página ao buscar
    this.loadData();
  }

  // Helper para centralizar a atualização dos signals da tabela
  private setPageData(page: any) {
    this.servidores.set(page.content);
    this.totalElements.set(page.totalElements);
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
      error: () => this.showMessage('Erro ao carregar lista de status'),
    });
  }

  private showMessage(msg: string) {
    this.snackBar.open(msg, 'Fechar', { duration: 3000, horizontalPosition: 'right' });
  }
}
