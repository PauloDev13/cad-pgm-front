import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FeriadoTableComponent } from '../../components/feriado-table/feriado-table.component';
import { FeriadoService } from '../../services/feriado.service';
import { CustomDeleteService } from '../../../../shared/service/custom-delete.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, firstValueFrom, Subject } from 'rxjs';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeriadoResponseDTO } from '../../models/feriado.model';
import { PageEvent } from '@angular/material/paginator';
import { FeriadoFormComponent } from '../../components/feriado-form/feriado-form.component';

@Component({
  selector: 'app-feriado-display',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FeriadoTableComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col bg-gray-50 rounded-2xl p-4 md:p-6 max-w-6xl
             mx-auto mt-0 w-full min-h-[320px] md:min-h-[400px]"
    >
      <!-- Cabeçalho da Página -->
      <div class="mb-4">
        <h2 class="text-xl md:text-2xl font-bold text-blue-800 leading-tight">
          Gestão de Feriados e Pontos Facultativos
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          Parametrize as datas que serão consideradas nos relatórios de Folha de Ponto
        </p>
      </div>
      <!-- Barra de Ações e Pesquisa -->
      <div
        class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4
               bg-white sm:bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200"
      >
        <mat-form-field appearance="outline" class="w-full sm:flex-1 md:max-w-md" subscriptSizing="dynamic">
          <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
          <mat-label>Pesquisar feriado...</mat-label>
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
          (click)="openModalNew()"
        >
          <mat-icon class="mr-1">add</mat-icon>
          Novo Feriado
        </button>
      </div>
      <!-- Tabela com Checkbox Lateral -->
      <app-feriado-table
        [data]="dataList()"
        [pageSize]="pageSize()"
        [currentPage]="currentPage()"
        [totalElements]="totalElements()"
        [isLoading]="isLoading()"
        (edit)="openModalEdit($event)"
        (deleteItem)="delete($event)"
        (toggleAtivo)="handleToggleAtivo($event)"
        (pageChange)="handlePageEvent($event)"
        (sortChange)="handleSortChanged($event)"
      />
    </div>
  `,
  styles: ``
})
export default class FeriadoDisplayPage implements OnInit {
  private readonly feriadoService = inject(FeriadoService);
  private readonly customDeleteService = inject(CustomDeleteService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  searchTerm = signal<string>('');
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  sortActive = signal<string>('data');
  sortDirection = signal<'asc' | 'desc'>('asc');

  dataResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      size: this.pageSize(),
      filter: this.searchTerm(),
      sortActive: this.sortActive(),
      sortDirection: this.sortDirection()
    }),

    stream: ({ params }) => {
      const sortObj = { active: params.sortActive, direction: params.sortDirection };
      return this.feriadoService.searchFilter(params.page, params.size, params.filter, sortObj);
    }
  });

  dataList = computed<FeriadoResponseDTO[]>(() => {
    return (this.dataResource.value()?.content as unknown as FeriadoResponseDTO[]) ?? [];
  });

  isLoading = this.dataResource.isLoading;

  totalElements = computed(() => {
    return this.dataResource.value()?.page?.totalElements ?? 0;
  });

  constructor() {
    effect(() => {
      const err = this.dataResource.error();
      if (err) {
        this.errorHandlerService.handle(err, 'Pesquisa de Feriados');
      }
    });
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((termo) => {
        const termoLimpo = termo.trim();

        if (termoLimpo === '' || termoLimpo.length >= 3) {
          this.searchTerm.set(termoLimpo);
          this.currentPage.set(0);
        }
      });
  }

  searchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  handleSortChanged(sort: { active: string; direction: 'asc' | 'desc' }): void {
    this.sortActive.set(sort.active);
    this.sortDirection.set(sort.direction);
    this.currentPage.set(0);
  }

  openModalNew(): void {
    const dialogRef = this.dialog.open(FeriadoFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: FeriadoResponseDTO | boolean) => {
      if (result) {
        this.currentPage.set(0);
        this.dataResource.reload();
      }
    });
  }

  openModalEdit(selectedItem: FeriadoResponseDTO): void {
    const dialogRef = this.dialog.open(FeriadoFormComponent, {
      width: '560px',
      maxWidth: '95vw',
      disableClose: true,
      data: selectedItem
    });

    dialogRef.afterClosed().subscribe((result: FeriadoResponseDTO | boolean) => {
      if (result && typeof result === 'object') {
        this.dataResource.update((currentData: any) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            content: (currentData.content as FeriadoResponseDTO[]).map(item =>
              item.id === result.id ? result : item
            )
          };
        });
      }
    });
  }

  async handleToggleAtivo(event: { item: FeriadoResponseDTO; novoStatus: boolean }): Promise<void> {
    const { item, novoStatus } = event;
    // Atualização otimista local
    this.dataResource.update((currentData: any) => {
      if (!currentData) return currentData;
      return {
        ...currentData,
        content: (currentData.content as FeriadoResponseDTO[]).map(i =>
          i.id === item.id ? { ...i, ativo: novoStatus } : i
        )
      };
    });

    try {
      await firstValueFrom(this.feriadoService.toggleStatus(item.id, novoStatus));
      this.notificationService.success(
        `Feriado "${item.nome}" ${novoStatus ? 'ativado' : 'desativado'} na Folha de Ponto!`,
        'Status Atualizado'
      );
    } catch (err: unknown) {
      // Reverte em caso de erro
      this.dataResource.reload();
      this.errorHandlerService.handle(err, 'Alteração de Status de Feriado');
    }
  }

  delete(item: FeriadoResponseDTO): void {
    this.customDeleteService.execute(
      () => this.feriadoService.delete(item.id),
      () => {
        this.dataResource.reload();
        this.currentPage.set(0);
      },
      { successMsg: `Feriado "${item.nome}" removido com sucesso!` }
    );
  }
}
