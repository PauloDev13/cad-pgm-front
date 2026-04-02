import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomListComponent } from '../../shared/components/custom-list.component/custom-list.component';
import { CargoResponseDTO, SaveRequest } from '../../core/models/cargo.model';
import { CargoService } from '../../core/services/cargo.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomDeleteService } from '../../shared/service/custom-delete.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomCadModalComponent } from '../../shared/components/custom-cad-modal.component/custom-cad-modal.component';
import { firstValueFrom } from 'rxjs';
import { ApiErrorHandlerService } from '../../shared/service/api-error-handler.service';
import { PageResponse } from '../../core/models/pagination.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-cargo-display',
  imports: [CustomListComponent],
  standalone: true,
  template: `
    <app-cargo-custom-list
      title="Cargo"
      [data]="cargos()"
      [pageSize]="pageSize()"
      [currentPage]="currentPage()"
      [totalElements]="totalElements()"
      (onAdd)="openModalNew()"
      (onEdit)="openModalEdit($event)"
      (onDelete)="delete($event)"
      (onPageChange)="handlePageEvent($event)"
      (onSearch)="handleSearch($event)"
    />
  `,
  styles: ``,
})
export default class CargoDisplayComponent implements OnInit {
  // O estado (lista de cargos) que será passado para o componente filho
  cargos = signal<CargoResponseDTO[]>([]);

  // signals para a pesquisa dinâmica paginada
  searchTerm = signal<string>('');
  totalElements = signal<number>(0);
  pageSize = signal<number>(6);
  currentPage = signal<number>(0);

  // injeção dos serviços
  private readonly cargoService = inject(CargoService);
  private readonly toastService = inject(ToastService);
  private readonly errorHandlerService = inject(ApiErrorHandlerService);
  private readonly customDeleteService = inject(CustomDeleteService);
  private readonly dialog = inject(MatDialog);

  ngOnInit() {
    this.loadCargos();
  }

  // busca os registros
  loadCargos() {
    // dados da paginação
    const page = this.currentPage();
    const size = this.pageSize();

    // Captura o conteúdo digitado no input de pesquisa
    const filter = this.searchTerm();

    // Regra de Negócio: Se tem algum filtro preenchido
    const isActivateFilter = filter && filter.trim() !== '';

    if (isActivateFilter) {
      // Chama o endpoint no Service (searchFilter) de pesquisa dinâmica
      this.cargoService.searchFilter(page, size, filter).subscribe({
        next: (pageData) => this.setPageData(pageData),
        error: () => this.toastService.error('Erro ao filtrar dados'),
      });
    } else {
      // se não tem filtro, chama o endpoint (finByAll) com todos os registros
      this.cargoService.findAll(page, size).subscribe({
        next: (pageData) => {
          this.setPageData(pageData);
        },
        error: (err) => {
          console.error('Erro ao buscar cargos', err);
          this.toastService.error('Erro ao buscar cargos');
        },
      });
    }
  }

  openModalNew() {
    this.openDialogForm();
  }

  openModalEdit(selectedCargo: CargoResponseDTO) {
    this.openDialogForm(selectedCargo);
  }

  delete(id: number) {
    this.customDeleteService.execute(
      () => this.cargoService.delete(id),
      () => this.loadCargos(),
      { successMsg: 'Cargo removido com sucesso!' },
    );
  }

  // insere ou edita um registro
  async save({ id, payload }: SaveRequest) {
    try {
      // se tem id, é para Editar, se não, é para Inserir
      if (id) {
        await firstValueFrom(this.cargoService.update(id, payload));
      } else {
        await firstValueFrom(this.cargoService.create(payload));
      }

      this.toastService.success(`Cargo ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
      // Recarrega a tabela com os dados novos
      this.loadCargos();
    } catch (error: any) {
      this.errorHandlerService.errorHandler(error);
    }
  }

  // Criamos apenas o tratador do evento que vem do filho:
  handleSearch(termo: string) {
    this.searchTerm.set(termo);
    this.currentPage.set(0); // Reseta a página sempre que buscar algo novo
    this.loadCargos();
  }

  handlePageEvent(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCargos();
  }

  // Método privado que centraliza a abertura do Dialog
  private openDialogForm(selectedCargo?: CargoResponseDTO) {
    const dialogRef = this.dialog.open(CustomCadModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: 'Cargo', // Dizemos pro Dialog que ele está lidando com Cargos
        element: selectedCargo, // Passamos o cargo inteiro se for edição, ou undefined se for novo
      },
    });

    // Quando o usuário clica em Salvar lá no Dialog, ele cai aqui:
    dialogRef.afterClosed().subscribe((result) => {
      // Se tiver resultado (não cancelou), chamamos a API!
      if (result) {
        this.save(result).then();
      }
    });
  }

  // Helper para centralizar a atualização dos signals da tabela
  private setPageData(response: PageResponse<any>) {
    this.cargos.set(response.content);
    this.totalElements.set(response.page.totalElements);
    this.currentPage.set(response.page.number);
  }
}
