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
import { ActivatedFilterComponent } from '../component/servidor-filter/activated-filter.component';
import { ServidorTableComponent } from '../component/servidor-table/servidor-table.component';
import { MatTabsModule } from '@angular/material/tabs';
import { DeletedFilterComponent } from '../component/servidor-filter/deleted-filter.component';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

@Component({
  selector: 'app-servidor-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-gray-50 rounded-2xl p-4 md:p-6 mx-auto mt-0 w-full print:bg-white
            print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full"
    >
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 print:mb-4">
        <div>
          <h1
            class="text-xl md:text-2xl font-bold leading-tight print:text-black print:text-2xl"
            [class]="activeTableIndex() === 0 ? 'text-blue-800' : 'text-red-600'"
          >
            Gestão de Servidores {{ activeTableIndex() === 0 ? 'Ativos' : 'Desligados' }}
          </h1>
          <p class="text-sm text-gray-600 mt-1 print:hidden">Gerencie os servidores do sistema</p>
        </div>

        @if (activeTableIndex() === 0) {
          <button
            mat-flat-button
            class="!bg-blue-600 !text-white w-full sm:w-auto sm:gap-2 !transition-transform duration-300
             !ease-in-out hover:!scale-105 flex justify-center items-center !h-12 sm:!h-10
             print:hidden"
            (click)="openForm()"
          >
            <mat-icon>add</mat-icon>
            Novo
          </button>
        }
      </div>

      <mat-tab-group
        (selectedIndexChange)="activeTableIndex.set($event)"
        animationDuration="0ms"
        class="w-full custom-folder-tabs">
        <mat-tab label="Quadro Ativo">
          <div class="pt-0">
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
                [status]="selectedStatusId()"
                [currentPage]="currentPage()"
                (edit)="openForm($event)"
                (delete)="delete($event)"
                (pageChange)="onPageChange($event)"
              />
            </div>
          </div>
        </mat-tab>
        <mat-tab label="Quadro Desligado">
          <div class="pt-0">
            <div class="print:hidden">
              <app-deleted-filter
                [searchType]="searchDeletedType()"
                [searchTerm]="searchDeletedTerm()"
                (searchTypeChange)="onSearchDeletedTypeChange($event)"
                (searchInput)="onSearchDeletedInput($event)"
              />
            </div>
            <app-servidor-table
              tableMode="EXCLUDED"
              [data]="excludedServidores()"
              [isLoading]="isExcludedLoading()"
              [status]="selectedStatusId()"
              [totalElements]="excludedTotalElements()"
              [pageSize]="excludedPageSize()"
              [currentPage]="excludedCurrentPage()"
              (reactivate)="openReactivateForm($event)"
              (pageChange)="onExcludedPageChange($event)"
            />
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ActivatedFilterComponent,
    ServidorTableComponent,
    MatTabsModule,
    DeletedFilterComponent
  ]
})
export default class ServidorListPage implements OnInit {
  // Injeções de dependências
  private readonly servidorService = inject(ServidorService);
  private readonly dominioService = inject(DominioService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly dialog = inject(MatDialog);
  private readonly customDeleteService = inject(CustomDeleteService);

  // Signal que controla qual aba está ativa (ativos ou lixeira)
  activeTableIndex = signal(0);

  //Signal de estado independente para a aba de ativos
  isLoading = signal<boolean>(false);
  servidores = signal<ServidorResponseDTO[]>([]);
  statusList = signal<BaseEntityDTO[]>([]);
  totalElements = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  selectedStatusId = signal<number | null>(null);
  searchType = signal<'CPF' | 'MATRICULA' | 'NOME'>('NOME');
  searchTerm = signal<string>('');

  // Sinal de estado independente para a aba de Lixeira
  isExcludedLoading = signal<boolean>(false);
  excludedServidores = signal<ServidorResponseDTO[]>([]);
  searchDeletedType = signal<'CPF' | 'NOME'>('NOME');
  excludedPageSize = signal<number>(10);
  excludedCurrentPage = signal<number>(0);
  excludedTotalElements = signal<number>(0);
  searchDeletedTerm = signal<string>('');

  //O funil de eventos de digitação para aba lixeira
  private searchDeletedSubject = new Subject<string>();

  //O funil de eventos de digitação para aba ativos
  private searchSubject = new Subject<string>();

  // O Angular nos dá uma referência da destruição deste componente
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // Aba ativos
    this.carregarFiltrosIniciais();
    this.configurarDebounceDePesquisa();

    // Aba lixeira
    this.loadExcludedData();
    this.configureSearchDebounceDeleted();
  }

  // Busca os dados para a aba ativa de acordo com o filtro de pesquisa
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
          error: (err) => this.errorHandlerService.handle(err, 'Pesquisa Ativos')
        });
    } else {
      // Chama o ENDPOINT ORIGINAL (findAll) - Listagem limpa
      this.servidorService
        .findAll(page, size)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (pageData) => this.setPageData(pageData),
          error: (err) => {
            this.errorHandlerService.handle(err, 'Loading Ativos');
          }
        });
    }
  }

  // Busca os dados para a aba lixeira de acordo com o filtro de pesquisa
  loadExcludedData() {
    this.isExcludedLoading.set(true);

    const page = this.excludedCurrentPage();
    const size = this.excludedPageSize();

    const term = this.searchDeletedTerm();

    const hasActiveFilter = term && term.trim() !== '';

    if (hasActiveFilter) {
      this.servidorService.searchExcluded(term, page, size)
        .pipe(finalize(() => this.isExcludedLoading.set(false)))
        .subscribe({
          next: (response) => {
            this.excludedServidores.set(response.content);
            this.excludedTotalElements.set(response.page.totalElements);
            this.excludedCurrentPage.set(response.page.number);
          },
          error: (err) => {
            this.errorHandlerService.handle(err, 'Pesquisa Lixeira');
          }
        });
    } else {
      this.servidorService.getExcluded(page, size)
        .pipe(finalize(() => this.isExcludedLoading.set(false)))
        .subscribe({
          next: (response) => {
            this.excludedServidores.set(response.content);
            this.excludedTotalElements.set(response.page.totalElements);
            this.excludedCurrentPage.set(response.page.number);
          },
          error: (err) => {
            this.errorHandlerService.handle(err, 'Loading Lixeira');
          }
        });
    }
  }

  // abre o formulário de cadastro em modo novo
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

  // Abre o formulário em modo de readmissão
  openReactivateForm(servidor: ServidorResponseDTO) {
    const dialogRef = this.dialog.open(ServidorFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vw',
      // Passamos o payload e a intenção
      data: { payload: servidor, action: 'REACTIVATE' },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Se deu sucesso, recarrega as duas abas!
        // Assim o servidor some da aba de excluídos e aparece na de ativos instantaneamente.
        this.loadData();
        this.loadExcludedData();
      }
    });
  }

  // Exclui registro ativos
  delete(payload: ServidorResponseDTO) {
    this.customDeleteService.execute(
      () => this.servidorService.delete(payload),
      () => {
        this.loadData();
        this.loadExcludedData();
      },
      {
        title: 'Servidor',
        message: `Esta ação não poderá ser desfeita.
                  Excluir o perfil de:
                  <strong class="text-red-600">${payload.nome.toUpperCase()}</strong>?`,
        successMsg: `Perfil de: <strong>${payload.nome.toUpperCase()}</strong> removido`
      }
    );
  }

  // Controla a paginação da aba de ativos
  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  // Controla a paginação da aba de lixeira
  onExcludedPageChange(event: PageEvent) {
    this.excludedCurrentPage.set(event.pageIndex);
    this.excludedPageSize.set(event.pageSize);
    this.loadExcludedData();
  }

  // É o chamado pelo HTML quando o usuário troca o Status
  onStatusChange(id: number | null) {
    this.selectedStatusId.set(id);
    // Limpa o input de texto (CPF/Matrícula)
    this.searchTerm.set('');
    this.currentPage.set(0); // Reseta para a primeira página
    this.loadData(); //Dispara a busca limpa no backend
  }

  // É chamado pelo HTML quando o usuário digita no campo de busca de ativos
  // O HTML não atualiza mais o Signal direto, ele alimenta o Subject
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

  // É chamado pelo HTML quando o usuário digita no campo de busca de lixeira
  // O HTML não atualiza mais o Signal direto, ele alimenta o Subject
  onSearchDeletedInput(event: Event) {
    let value = (event.target as HTMLInputElement).value;

    // Regra de Validação: Se for CPF, remove tudo que não for número e limita a 11 dígitos
    if (this.searchDeletedType() === 'CPF') {
      value = value.replace(/\D/g, '').substring(0, 11);
      (event.target as HTMLInputElement).value = value; // Reflete a mudança no input HTML
    }

    // Joga o valor digitado no "funil" do RxJS.
    // O subscribe ali em cima vai decidir quando disparar a busca.
    this.searchDeletedSubject.next(value);
  }

  // É chamado quando o usuário troca entre Nome, CPF ou Matrícula na aba ativos
  onSearchTypeChange(newType: 'CPF' | 'MATRICULA' | 'NOME') {
    this.searchType.set(newType);
    this.searchTerm.set(''); // Limpa a memória oficial

    // Esvazia o "funil" do RxJS para garantir que nenhuma busca fantasma aconteça
    this.searchSubject.next('');

    this.currentPage.set(0); // Volta para página 1
    this.loadData(); //Recarrega a tabela mostrando todos os registros novamente!
  }

  // É chamado quando o usuário troca entre Nome, CPF ou Matrícula na aba lixeira
  onSearchDeletedTypeChange(newType: 'CPF' | 'NOME') {
    this.searchDeletedType.set(newType);
    this.searchDeletedTerm.set(''); // Limpa a memória oficial

    // Esvazia o "funil" do RxJS para garantir que nenhuma busca fantasma aconteça
    this.searchDeletedSubject.next('');

    this.excludedCurrentPage.set(0); // Volta para página 1
    this.loadExcludedData(); //Recarrega a tabela mostrando todos os registros novamente!
  }

  // Busca dinâmica na aba lixeira
  private configureSearchDebounceDeleted() {
    this.searchDeletedSubject
      .pipe(
        debounceTime(500), // Espera o usuário parar de digitar por 500ms
        distinctUntilChanged(), // Só continua se a palavra final for diferente da última busca
        takeUntilDestroyed(this.destroyRef) // Dizemos pro fluxo morrer com o componente
      )
      .subscribe((typedTerm) => {
        // Se o usuário apagou tudo (Cenário 1)
        if (typedTerm.trim() === '') {
          this.searchDeletedTerm.set(''); // Limpa o termo no Signal
          this.excludedCurrentPage.set(0); // Volta para página 1
          this.loadExcludedData(); // Recarrega a tabela completa!
          return;
        }

        //  Só busca se tiver 3 caracteres ou mais (Cenário 2)
        if (typedTerm.trim().length >= 3) {
          this.searchDeletedTerm.set(typedTerm.trim());
          this.excludedCurrentPage.set(0);
          this.loadExcludedData();
        }
      });
  }

  // Busca dinâmica na aba ativos
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

  // Helper para centralizar a atualização dos signals da tabela na aba ativos
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
        const ativo = statusData.find(
          (s) => (s.descricao || s.nome)?.toLowerCase() === 'ativo');

        if (ativo) {
          this.selectedStatusId.set(ativo.id); // Seta Ativo como padrão
        }

        // Após configurar o status padrão, chamamos a listagem inicial
        this.loadData();
      },
      error: (err) => {
        this.errorHandlerService.handle(err, 'Loading Status');
      }
    });
  }
}
