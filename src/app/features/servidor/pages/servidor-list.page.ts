import { ChangeDetectionStrategy, Component, effect, inject, Injector, input, OnInit, signal } from '@angular/core';
import { ServidorResponseDTO, TServidorDelete } from '../models/servidor.model';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServidorFormComponent } from '../component/servidor-form/servidor-form.component';
import { CustomDeleteService } from '../../../shared/service/custom-delete.service';
import { ActivatedFilterComponent } from '../component/servidor-filter/activated-filter.component';
import { ServidorTableComponent } from '../component/servidor-table/servidor-table.component';
import { MatTabsModule } from '@angular/material/tabs';
import { DeletedFilterComponent } from '../component/servidor-filter/deleted-filter.component';
import { ServidoresStore } from '../store/servidor.store';
import { DominioService } from '../services/dominio.service';

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
                [statusList]="servidoresStore.status()"
                [cargoList]="servidoresStore.cargos()"
                [setorList]="servidoresStore.setores()"
                [selectedStatusId]="servidoresStore.selectedStatusId()"
                [selectedCargoId]="servidoresStore.selectedCargoId()"
                [selectedSetorId]="servidoresStore.selectedSetorId()"
                [searchType]="servidoresStore.searchType()"
                [searchTerm]="servidoresStore.searchTerm()"
                (statusChange)="servidoresStore.updateDropdownFilter({ selectedStatusId: $event })"
                (cargoChange)="servidoresStore.updateDropdownFilter({ selectedCargoId: $event })"
                (setorChange)="servidoresStore.updateDropdownFilter({ selectedSetorId: $event })"
                (searchTypeChange)="servidoresStore.updateSearchType($event)"
                (searchInput)="onSearchInput($event)"
                (cleanFilters)="servidoresStore.clearAllFilters()"
              />
            </div>

            <div class="w-full">
              <app-servidor-table
                [data]="servidoresStore.servidores()"
                [isLoading]="servidoresStore.isLoading()"
                [status]="servidoresStore.selectedStatusId()"
                [pageSize]="servidoresStore.pageSize()"
                [currentPage]="servidoresStore.currentPage()"
                [totalElements]="servidoresStore.totalElements()"
                (edit)="openForm($event)"
                (delete)="deleteServidor($event)"
                (pageChange)="onPageChangeStore($event)"
              />
            </div>
          </div>
        </mat-tab>
        <mat-tab label="Quadro Desligado">
          <div class="pt-0">
            <div class="print:hidden">
              <app-deleted-filter
                [searchType]="servidoresStore.excludedSearchType()"
                [searchTerm]="servidoresStore.excludedSearchTerm()"
                (searchTypeChange)="servidoresStore.updateExcludedSearchType($event)"
                (searchInput)="onSearchExcludedInput($event)"
              />
            </div>
            <app-servidor-table
              tableMode="EXCLUDED"
              [data]="servidoresStore.excludedServidores()"
              [isLoading]="servidoresStore.isLoading()"
              [status]="null"
              [totalElements]="servidoresStore.excludedTotalElements()"
              [pageSize]="servidoresStore.excludedPageSize()"
              [currentPage]="servidoresStore.excludedCurrentPage()"
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
  protected readonly servidoresStore = inject(ServidoresStore);
  private readonly dominioService = inject(DominioService);
  private readonly injector = inject(Injector);
  private readonly dialog = inject(MatDialog);
  private readonly customDeleteService = inject(CustomDeleteService);

  // Signal que controla qual aba está ativa (ativos ou lixeira)
  activeTableIndex = signal(0);

  // O Angular injeta o id do Status que vem na URL direto aqui!
  statusId = input<number | null>(null);

  constructor() {
    effect(() => {
      const statusIdUrl = this.statusId();

      if (statusIdUrl) {
        this.servidoresStore.updateDropdownFilter({
          selectedStatusId: Number(statusIdUrl)
        });
      }
    });
  }

  ngOnInit() {
    // Força a releitura das listas que preenchem os Dropdowns de pesquisa
    this.dominioService.statusResource.reload();
    this.dominioService.cargosResource.reload();
    this.dominioService.setoresResource.reload();

  }

  // MÉTODO PARA OS DADOS ATIVOS
  // É chamado pelo HTML quando o usuário digita no campo de busca
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    // Jogamos o valor diretamente no método reativo da Store!
    // A Store vai esperar os 500ms e checar as regras antes de buscar.
    this.servidoresStore.updateSearchTermDebounced(value);
  }

  onPageChangeStore(event: any) {
    this.servidoresStore.updatePagination(event.pageIndex, event.pageSize);
  }

  // abre o formulário de cadastro em modo novo
  openForm(servidor?: ServidorResponseDTO) {
    const dialogRef = this.dialog.open(ServidorFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vw',
      data: servidor,
      disableClose: true,
      injector: this.injector // Injeta uma a mesma instância do provider do pai para o filho
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (payload) {
        const isEdit = !!payload.id;
        // Se for edição, atualiza o servidoresResource
        if (isEdit) {
          this.servidoresStore.updateLocalServidor(payload);
        } else {
          // Se não, faz o reload para atualizar os dados após o insert
          this.servidoresStore.reloadBothList();
        }
      }
    });
  }

  // Abre o formulário em modo de readmissão
  openReactivateForm(servidor: ServidorResponseDTO) {
    const action = servidor.status?.descricao === 'Inativo'
      ? 'UPDATE'
      : 'REACTIVATE';

    const dialogRef = this.dialog.open(ServidorFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vw',
      // Passamos o payload e a intenção
      data: { payload: servidor, action: action },
      disableClose: true,
      injector: this.injector // Injeta uma a mesma instância do provider do pai para o filho
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (payload) {
        this.servidoresStore.updateLocalServidor(payload);

        // Atualiza as listas de Ativos e Desligados
        this.servidoresStore.reloadBothList();
      }
    });
  }

  // MÉTODO PARA OS DADOS ATIVOS E DESLIGADOS
  // Controla a paginação da aba de lixeira
  onExcludedPageChange(event: PageEvent) {
    this.servidoresStore.updateExcludedPagination(event.pageIndex, event.pageSize);
  }

  // É chamado pelo HTML quando o usuário digita no campo de busca
  onSearchExcludedInput(event: Event) {
    let value = (event.target as HTMLInputElement).value;

    // Regra de Validação: Se for CPF, remove tudo que não for número e limita a 11 dígitos
    if (this.servidoresStore.excludedSearchType() === 'CPF') {
      value = value.replace(/\D/g, '').substring(0, 11);
      (event.target as HTMLInputElement).value = value; // Reflete a mudança no input HTML
    }

    // Joga o valor digitado no "funil" do RxJS.
    this.servidoresStore.updateExcludedSearchTermDebounced(value);
  }

  // MÉTODO PARA OS DADOS ATIVOS E DESLIGADOS
  async deleteServidor(payload: TServidorDelete) {
    const confirmed = await this.customDeleteService.confirm({
      title: 'Servidor',
      message: `Esta ação não poderá ser desfeita.
                  Excluir o perfil de:
                  <strong class="text-red-600">${payload.nome.toUpperCase()}</strong>?`
    });

    if (confirmed) {
      this.servidoresStore.deleteServidor({
        payload,
        onSuccess: () => {
          this.customDeleteService.showSuccessNotification(
            `Perfil de: <strong>${payload.nome.toUpperCase()}</strong> foi removido`
          );
          this.servidoresStore.reloadBothList();
        }
      });
    }
  }
}
