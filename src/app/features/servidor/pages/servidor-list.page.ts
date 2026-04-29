import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ServidorService } from '../services/servidor.service';
import { BaseEntityDTO, ServidorResponseDTO } from '../models/servidor.model';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServidorFormComponent } from '../component/servidor-form/servidor-form.component';
import { DominioService } from '../services/dominio.service';
import { PageResponse } from '../../../shared/model/pagination.model';
import { CustomDeleteService } from '../../../shared/service/custom-delete.service';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ServidorFilterComponent } from '../component/servidor-filter/servidor-filter.component';
import { ServidorTableComponent } from '../component/servidor-table/servidor-table.component';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';

@Component({
  selector: 'app-servidor-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-gray-50 shadow-md rounded-2xl border border-gray-200 p-4 md:p-6 mx-auto
            mt-0 w-full max-w-7xl print:bg-white print:shadow-none print:border-none
            print:p-0 print:m-0 print:max-w-full"
    >
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 print:mb-4">
        <div>
          <h1
            class="text-xl md:text-2xl font-bold text-blue-800 leading-tight print:text-black
                  print:text-2xl">
            Gestão de Servidores
          </h1>
          <p class="text-sm text-gray-500 mt-1 print:hidden">Gerencie os servidores do sistema</p>
        </div>

        <button
          mat-flat-button
          class="!bg-blue-600 !text-white w-full sm:w-auto !transition-transform duration-300
             !ease-in-out hover:!scale-105 flex justify-center items-center !h-12 sm:!h-10
             print:hidden"
          (click)="openForm()"
        >
          <mat-icon class="mr-1">add</mat-icon>
          Novo
        </button>
      </div>

      <div class="print:hidden">
        <app-servidor-filter
          [statusList]="statusList()"
          [selectedStatusId]="selectedStatusId()"
          [searchType]="searchType()"
          [searchTerm]="searchTerm()"
          (statusChange)="onStatusChange($event)"
          (searchTypeChange)="onSearchTypeChange($event)"
          (searchInput)="onSearchInput($event)"
        />
      </div>

      <div class="w-full">
        <app-servidor-table
          [data]="servidores()"
          [isLoading]="isLoading()"
          [totalElements]="totalElements()"
          [pageSize]="pageSize()"
          [currentPage]="currentPage()"
          (edit)="openForm($event)"
          (delete)="delete($event)"
          (pageChange)="onPageChange($event)"
        />
      </div>
    </div>
  `,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ServidorFilterComponent,
    ServidorTableComponent
  ]
})
export default class ServidorListPage implements OnInit {
  // Injeções de dependências
  private readonly servidorService = inject(ServidorService);
  private readonly dominioService = inject(DominioService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly customDeleteService = inject(CustomDeleteService);

  //Signals para Estado
  servidores = signal<ServidorResponseDTO[]>([]);
  totalElements = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  isLoading = signal<boolean>(false);

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

  ngOnInit(): void {
    // inicializa os filtro da pesquisa
    this.carregarFiltrosIniciais();
    this.configurarDebounceDePesquisa(); // Inicializa o nosso escutador
  }

  // centralizador: Decide qual endpoint chamar com base nos filtros
  loadData() {
    this.isLoading.set(true);

    // Captura os valores atuais dos signals de paginação
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
      this.servidorService
        .searchFilter(page, size, statusId, cpf, matricula, nome)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (pageData) => {
            this.setPageData(pageData);
            // this.totalElements.set(pageData.page.totalElements);
          },
          error: (err: Error) => this.notificationService.error(err.message, 'Pesquisar')
        });
    } else {
      // Chama o ENDPOINT ORIGINAL (findAll) - Listagem limpa
      this.servidorService
        .findAll(page, size)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (pageData) => this.setPageData(pageData),
          error: (err: Error) => {
            this.notificationService.error(err.message, 'Load');
            console.error('Erro ao carregar dados ' + err.message);
          }
        });
    }
  }

  // abre o modal com formulário de cadastro
  openForm(servidor?: ServidorResponseDTO) {
    const dialogRef = this.dialog.open(ServidorFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vw',
      data: servidor,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData(); // Recarrega se houve alteração
      }
    });
  }

  // exclui registro
  delete(payload: ServidorResponseDTO) {
    this.customDeleteService.execute(
      () => this.servidorService.delete(payload),
      () => this.loadData(),
      {
        title: 'Servidor',
        message: `Esta ação não poderá ser desfeita.
                  Excluir o perfil de:
                  <strong class="text-red-600">${payload.nome.toUpperCase()}</strong>?`,
        successMsg: `Perfil de: <strong>${payload.nome.toUpperCase()}</strong> removido`
      }
    );
  }

  // controla a paginação
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

    // Regra de Validação: Se for CPF, remove tudo que não for número e limita a 11 dígitos
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

    this.currentPage.set(0); // Volta para página 1
    this.loadData(); //Recarrega a tabela mostrando todos os registros novamente!
  }

  //  NOVO MÉTODO PARA BUSCA DINÂMICA
  private configurarDebounceDePesquisa() {
    this.searchSubject
      .pipe(
        debounceTime(500), // Espera o usuário parar de digitar por 500ms
        distinctUntilChanged(), // Só continua se a palavra final for diferente da última busca
        takeUntilDestroyed(this.destroyRef) // Dizemos pro fluxo morrer com o componente
      )
      .subscribe((termoDigitado) => {
        // Se o usuário apagou tudo (Cenário 1)
        if (termoDigitado.trim() === '') {
          this.selectedStatusId.set(null); // Volta para "Todos os Status"
          this.searchTerm.set(''); // Limpa o termo no Signal
          this.currentPage.set(0); // Volta para página 1
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
      error: () => {
        this.notificationService.error('Erro ao carregar lista de status', 'Loading');
        console.error('Erro ao carregar lista');
      }
    });
  }
}
