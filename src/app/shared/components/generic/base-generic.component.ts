import { Directive, inject, OnInit, signal } from '@angular/core';
import { ToastService } from '../../service/toast.service';
import { ApiErrorHandlerService } from '../../service/api-error-handler.service';
import { CustomDeleteService } from '../../service/custom-delete.service';
import { MatDialog } from '@angular/material/dialog';
import { ICrudGeneric } from '../../model/crud-generic.model';
import { PageEvent } from '@angular/material/paginator';
import { finalize, firstValueFrom } from 'rxjs';
import { CustomCadModalComponent } from '../custom-cad-modal.component';
import { PageResponse } from '../../model/pagination.model';
import { SingleInputDialogData, SingleInputModalResult } from '../../model/base-generic.model';

@Directive()
export abstract class BaseGenericComponent<T> implements OnInit {
  // Estado (Renomeamos de "cargos" para um nome genérico "dataList")
  dataList = signal<T[]>([]);

  isLoading = signal<boolean>(false);

  searchTerm = signal<string>('');
  totalElements = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);

  // Injeções
  protected readonly toastService = inject(ToastService);
  protected readonly errorHandlerService = inject(ApiErrorHandlerService);
  protected readonly customDeleteService = inject(CustomDeleteService);
  protected readonly dialog = inject(MatDialog);

  // Contratos que o Componente Filho DEVE fornecer
  abstract get entityService(): ICrudGeneric<T>; // Qual serviço usar

  abstract get entityTitle(): string; // Qual o título? (ex: 'Cargo')

  abstract get inputLabel(): string; // Ex: 'Nome do Cargo'

  abstract getInputValue(item: T): string; // Ex: return item.nome;

  abstract buildPayload(value: string): any; // Ex: return { nome: value };

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    const page = this.currentPage();
    const size = this.pageSize();
    const filter = this.searchTerm();

    if (filter && filter.trim() !== '') {
      this.entityService
        .searchFilter(page, size, filter)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (pageData) => this.setPageData(pageData),
          error: () => this.toastService.error(`Erro ao filtrar ${this.entityTitle}s`),
        });
    } else {
      this.entityService
        .findAll(page, size)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (pageData) => this.setPageData(pageData),
          error: (err) => {
            console.error(`Erro ao buscar ${this.entityTitle}s`, err);
            this.toastService.error(`Erro ao buscar ${this.entityTitle}s`);
          },
        });
    }
  }

  openModalNew() {
    this.openDialogForm();
  }

  openModalEdit(selectedItem: T) {
    this.openDialogForm(selectedItem);
  }

  delete(id: number) {
    this.customDeleteService.execute(
      () => this.entityService.delete(id),
      () => {
        this.loadData();
        this.currentPage.set(0);
      },
      { successMsg: `${this.entityTitle} removido(a) com sucesso!` },
    );
  }

  async save(resultado: any) {
    try {
      if (resultado.id) {
        await firstValueFrom(this.entityService.update(resultado.id, resultado.payload));
      } else {
        await firstValueFrom(this.entityService.create(resultado.payload));
      }
      // this.toastService.success(`${this.entityTitle} salvo(a) com sucesso!`);
      this.toastService.success(
        `${this.entityTitle} ${resultado.id ? 'atualizado' : 'cadastrado'} com sucesso!`,
      );
      this.loadData();
    } catch (error: any) {
      this.errorHandlerService.errorHandler(error);
    }
  }

  handleSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(0);
    this.loadData();
  }

  handlePageEvent(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  private openDialogForm(selectedItem?: T) {
    const dialogRef = this.dialog.open(CustomCadModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: this.entityTitle,
        inputLabel: this.inputLabel,
        inputValue: selectedItem ? this.getInputValue(selectedItem) : '',
        id: selectedItem ? (selectedItem as any).id : undefined,
      } as SingleInputDialogData,
    });

    dialogRef.afterClosed().subscribe((result: SingleInputModalResult) => {
      if (result) {
        // A classe base pede para o filho montar o Payload correto!
        const payload = this.buildPayload(result.value);

        // A classe base pede para o filho montar o Payload correto!
        this.save({ id: result.id, payload }).then();
      }
    });
  }

  // private setPageData(response: any) {
  private setPageData(response: PageResponse<any>) {
    this.dataList.set(response.content);
    this.totalElements.set(response.page.totalElements);
    this.currentPage.set(response.page.number);
  }
}
