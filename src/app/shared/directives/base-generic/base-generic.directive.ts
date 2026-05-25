import { computed, Directive, effect, inject, signal } from '@angular/core';
import { CustomDeleteService } from '../../service/custom-delete.service';
import { MatDialog } from '@angular/material/dialog';
import { ICrudGeneric } from '../../model/generic/crud-generic.model';
import { PageEvent } from '@angular/material/paginator';
import { firstValueFrom } from 'rxjs';
import { CustomCadModalComponent } from '../../components/custom-cad-modal/custom-cad-modal.component';
// import { PageResponse } from '../../model/pagination.model';
import { SingleInputDialogData, SingleInputModalResult } from '../../model/generic/base-generic.model';
import { NotificationService } from '../../service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../service/error-handler.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Directive()
export abstract class BaseGenericDirective<T> {
  // Estado (Renomeamos de "cargos" para um nome genérico "dataList")
  // dataList = signal<T[]>([]);

  // isLoading = signal<boolean>(false);

  searchTerm = signal<string>('');
  // totalElements = signal<number>(0);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);

  // Injeções
  protected readonly notificationService = inject(NotificationService);
  protected readonly errorHandlerService = inject(ErrorHandlerService);
  protected readonly customDeleteService = inject(CustomDeleteService);
  protected readonly dialog = inject(MatDialog);

  // Contratos que o Componente Filho DEVE fornecer
  abstract get entityService(): ICrudGeneric<T>; // Qual serviço usar

  abstract get entityTitle(): string; // Qual o título? (ex: 'Cargo')

  abstract get inputLabel(): string; // Ex: 'Nome do Cargo'

  abstract getInputValue(item: T): string; // Ex: return item.nome;

  abstract buildPayload(value: string): any; // Ex: return { nome: value };

  constructor() {
    effect(() => {
      const err = this.dataResource.error();
      if (err) {
        this.errorHandlerService.handle(err, `Pesquisa ${this.entityTitle}s`);
      }
    });
  }

  dataResource = rxResource({
    params: () => {
      return {
        page: this.currentPage(),
        size: this.pageSize(),
        filter: this.searchTerm()
      };
    },
    stream: ({ params }) => {
      return this.entityService.searchFilter(params.page, params.size, params.filter);
    }
  });

  dataList = computed(() => {
    return this.dataResource.value()?.content ?? [];
  });

  isLoading = this.dataResource.isLoading;

  totalElements = computed(() => {
    return this.dataResource.value()?.page?.totalElements ?? 0;
  });

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
        // this.loadData();
        this.dataResource.reload();
        this.currentPage.set(0);
      },
      { successMsg: `${this.entityTitle} removido(a) com sucesso!` }
    );
  }

  async save(resultado: any) {
    try {
      const isEdit = !!resultado.id;

      if (isEdit) {
        await firstValueFrom(this.entityService.update(resultado.id, resultado.payload));
      } else {
        await firstValueFrom(this.entityService.create(resultado.payload));
      }

      this.notificationService.success(
        `${this.entityTitle} ${resultado.id ? 'atualizado' : 'cadastrado'} com sucesso!`,
        'Cadastro'
      );


      if (isEdit) {
        this.dataResource.update((currentData) => {
          if (!currentData) return currentData;

          return {
            ...currentData,
            content: currentData.content.map((item: any) => item.id === resultado.id
              ? { id: resultado.id, ...resultado.payload }
              : item
            )
          };
        });
      } else {
        this.currentPage.set(0);
        this.dataResource.reload();
      }

    } catch (err: any) {
      this.errorHandlerService.handle(err, `${resultado.id ? 'atualizado' : 'cadastrado'}`);
    }
  }

  handleSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(0);
  }

  handlePageEvent(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  private openDialogForm(selectedItem?: T) {
    const dialogRef = this.dialog.open(CustomCadModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: this.entityTitle,
        inputLabel: this.inputLabel,
        inputValue: selectedItem ? this.getInputValue(selectedItem) : '',
        id: selectedItem ? (selectedItem as any).id : undefined
      } as SingleInputDialogData
    });

    dialogRef.afterClosed().subscribe((result: SingleInputModalResult) => {
      if (result) {
        // A classe base pede para o filho montar o Payload correto!
        const payload = this.buildPayload(result.value);
        // A classe base pede para o filho montar o Payload correto!
        this.save({ id: result.id, payload });
      }
    });
  }
}
