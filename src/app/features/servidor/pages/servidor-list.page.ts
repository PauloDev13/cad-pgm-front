import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, forkJoin, Subject } from 'rxjs';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ServidorService } from '../services/servidor.service';
import {
  BaseEntityDTO,
  IServidorExcludedQueryParams,
  IServidorQueryParams,
  ServidorResponseDTO
} from '../models/servidor.model';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServidorFormComponent } from '../component/servidor-form/servidor-form.component';
import { DominioService } from '../services/dominio.service';
import { CustomDeleteService } from '../../../shared/service/custom-delete.service';
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
                [cargoList]="cargoList()"
                [setorList]="setorList()"
                [(selectedStatusId)]="selectedStatusId"
                [(selectedCargoId)]="selectedCargoId"
                [(selectedSetorId)]="selectedSetorId"
                [searchType]="searchType()"
                [(searchTerm)]="searchTerm"
                (statusChange)="onStatusChange($event)"
                (cargoChange)="onCargoChange($event)"
                (setorChange)="onSetorChange($event)"
                (searchTypeChange)="onSearchTypeChange($event)"
                (searchInput)="onSearchInput($event)"
                (cleanFilters)="onCleanFilters()"
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
export default class ServidorListPage {
  // Injeções de dependências
  private readonly servidorService = inject(ServidorService);
  private readonly dominioService = inject(DominioService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly dialog = inject(MatDialog);
  private readonly customDeleteService = inject(CustomDeleteService);

  // Signal que controla qual aba está ativa (ativos ou lixeira)
  activeTableIndex = signal(0);

  //Signal de estado independente para a aba de ativos
  statusList = signal<BaseEntityDTO[]>([]);
  selectedStatusId = signal<number | null>(null);
  cargoList = signal<BaseEntityDTO[]>([]);
  selectedCargoId = signal<number | null>(null);
  setorList = signal<BaseEntityDTO[]>([]);
  selectedSetorId = signal<number | null>(null);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  searchType = signal<'CPF' | 'MATRICULA' | 'NOME'>('NOME');
  searchTerm = signal<string>('');

  // Sinal de estado independente para a aba de Lixeira
  searchDeletedType = signal<'CPF' | 'NOME'>('NOME');
  excludedPageSize = signal<number>(10);
  excludedCurrentPage = signal<number>(0);
  searchDeletedTerm = signal<string>('');

  //O funil de eventos de digitação para aba lixeira
  private searchDeletedSubject = new Subject<string>();

  //O funil de eventos de digitação para aba ativos
  private searchSubject = new Subject<string>();

  // O Angular nos dá uma referência da destruição deste componente
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const errActivated = this.servidoresResource.error();
      const errDeleted = this.servidoresResource.error();

      if (errActivated) {
        this.errorHandlerService.handle(errActivated, 'Ativos');
      }

      if (errDeleted) {
        this.errorHandlerService.handle(errDeleted, 'Desligados');
      }
      // Aba ativos
      this.carregarFiltrosIniciais();
      this.configurarDebounceDePesquisa();

      // Aba lixeira
      this.configureSearchDebounceDeleted();

    });
  }

  // Usa rxResources para buscar os registros paginados de Servidores Ativos
  servidoresResource = rxResource({
    params: () => {
      const termo = this.searchTerm();
      const tipo = this.searchType();

      const queryParams: IServidorQueryParams = {
        // Captura os valores atuais dos signals de paginação
        page: this.currentPage(),
        size: this.pageSize(),

        // Mapeia o termo de pesquisa para o parâmetro correto
        cpf: tipo === 'CPF' && termo ? termo : undefined,
        matricula: tipo === 'MATRICULA' && termo ? termo : undefined,
        nome: tipo === 'NOME' && termo ? termo : undefined,

        // Captura os valores atuais dos signals de filtro
        statusId: this.selectedStatusId(),
        cargoId: this.selectedCargoId(),
        setorId: this.selectedSetorId()
      };
      return queryParams;
    },
    stream: ({ params }) => {
      return this.servidorService.searchFilter(params);
    }
  });

  // Usa rxResources para buscar os registros paginados de Servidores Desligados
  servidoresExcludedResource = rxResource({
    params: () => {
      // const term = this.searchDeletedTerm();

      const queryParams: IServidorExcludedQueryParams = {
        page: this.excludedCurrentPage(),
        size: this.excludedPageSize(),
        term: this.searchDeletedTerm()
      };
      return queryParams;
    },
    stream: ({ params }) => {
      return this.servidorService.searchExcluded(params);
    }
  });

  // Extrai somente a lista de Servidores Ativos
  servidores = computed(() =>
    this.servidoresResource.value()?.content ?? []);

  // Extrai somente a lista de Servidores Desligados
  excludedServidores = computed(() =>
    this.servidoresExcludedResource.value()?.content ?? []);

  // Carregamento para Ativos e Desligados
  isLoading = this.servidoresResource.isLoading;
  isExcludedLoading = this.servidoresExcludedResource.isLoading;

  // Total de retistros Ativos
  totalElements = computed(() =>
    this.servidoresResource.value()?.page?.totalElements ?? 0);

  // Total de retistros Desligados
  excludedTotalElements = computed(() =>
    this.servidoresExcludedResource.value()?.page?.totalElements ?? 0);

  // abre o formulário de cadastro em modo novo
  openForm(servidor?: ServidorResponseDTO) {
    const dialogRef = this.dialog.open(ServidorFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vw',
      data: servidor,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((payload) => {
      const isEdit = !!payload.id;
      // Se for edição, atualiza o servidoresResource
      if (isEdit) {
        this.servidoresResource.update((currentServidor) => {
          if (!currentServidor) return currentServidor;

          return {
            ...currentServidor,
            content: currentServidor.content.map(servidor =>
              servidor.id === payload?.id ? payload : servidor
            )
          };
        });
      } else {
        // Se não, faz o reload para atualizar os dados após o insert
        this.servidoresResource.reload();
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

    dialogRef.afterClosed().subscribe((payload) => {
      if (payload) {
        this.servidoresExcludedResource.update((currentServidor) => {
          if (!currentServidor) return currentServidor;

          return {
            ...currentServidor,
            content: currentServidor.content.map(servidor =>
              servidor.id === payload?.id ? payload : servidor
            )
          };
        });

        // Atualiza as listas de Ativos e Desligados
        this.servidoresExcludedResource.reload();
        this.servidoresResource.reload();
      }
    });
  }

  // Exclui registro ativos
  delete(payload: ServidorResponseDTO) {
    this.customDeleteService.execute(
      () => this.servidorService.delete(payload),
      () => {
        this.servidoresResource.reload();
        this.servidoresExcludedResource.reload();
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
  }

  // Controla a paginação da aba de lixeira
  onExcludedPageChange(event: PageEvent) {
    this.excludedCurrentPage.set(event.pageIndex);
    this.excludedPageSize.set(event.pageSize);
  }

  // É o chamado pelo HTML quando o usuário troca o Status
  onStatusChange(id: number | null) {
    this.selectedStatusId.set(id);
    // Limpa o input de texto (CPF/Matrícula)
    this.searchTerm.set('');
    this.currentPage.set(0); // Reseta para a primeira página
  }

  // É o chamado pelo HTML quando o usuário troca o Cargo
  onCargoChange(id: number | null) {
    this.selectedCargoId.set(id);
    // Limpa o input de texto
    this.searchTerm.set('');
    this.currentPage.set(0); // Reseta para a primeira página
  }

  // É o chamado pelo HTML quando o usuário troca o Setor
  onSetorChange(id: number | null) {
    this.selectedSetorId.set(id);
    // Limpa o input de texto
    this.searchTerm.set('');
    this.currentPage.set(0); // Reseta para a primeira página
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
    this.searchTerm.set('');

    // Esvazia o "funil" do RxJS para garantir que nenhuma busca fantasma aconteça
    this.searchSubject.next('');
    this.currentPage.set(0); // Volta para página 1
  }

  // É chamado quando o usuário troca entre Nome, CPF ou Matrícula na aba lixeira
  onSearchDeletedTypeChange(newType: 'CPF' | 'NOME') {
    this.searchDeletedType.set(newType);
    this.searchDeletedTerm.set(''); // Limpa a memória oficial

    // Esvazia o "funil" do RxJS para garantir que nenhuma busca fantasma aconteça
    this.searchDeletedSubject.next('');

    this.excludedCurrentPage.set(0); // Volta para página 1
  }

  onCleanFilters() {
    this.selectedStatusId.set(null);
    this.selectedCargoId.set(null);
    this.selectedSetorId.set(null);
    this.searchTerm.set('');
  }

  // Busca dinâmica na aba Desligados
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
          return;
        }

        //  Só busca se tiver 3 caracteres ou mais (Cenário 2)
        if (typedTerm.trim().length >= 3) {
          this.searchDeletedTerm.set(typedTerm.trim());
          this.excludedCurrentPage.set(0);
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
          return;
        }

        //  Só busca se tiver 3 caracteres ou mais (Cenário 2)
        if (termoDigitado.trim().length >= 3) {
          this.searchTerm.set(termoDigitado.trim());
          this.currentPage.set(0);
        }
      });
  }

  // Busca a lista de Status
  private carregarFiltrosIniciais() {
    forkJoin({
      status: this.dominioService.getStatus(),
      cargos: this.dominioService.getCargos(),
      setores: this.dominioService.getSetores()
    })
      .pipe(
      ).subscribe({
      next: ({ status, cargos, setores }) => {
        this.statusList.set(status);
        this.cargoList.set(cargos);
        this.setorList.set(setores);
      },
      error: (err) => this.errorHandlerService.handle(err, 'Filtros iniciais')
    });
  }
}
