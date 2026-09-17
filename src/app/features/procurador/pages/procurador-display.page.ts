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
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProcuradorResponseDTO } from '../models/procurador.model';
import { ProcuradorService } from '../services/procurador.service';
import { ProcuradorTableComponent } from '../components/procurador-table/procurador-table.component';
import { ProcuradorFormComponent } from '../components/procurador-form/procurador-form.component';
import { CustomDeleteService } from '../../../shared/service/custom-delete.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';

@Component({
  selector: 'app-procurador-display',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ProcuradorTableComponent
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
          Gestão de Certificados Digitais
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          Gerencie a emissão e validade dos certificados digitais (A1 / A3)
        </p>
      </div>

      <!-- Barra de Ações e Pesquisa -->
      <div
        class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-4
               bg-white sm:bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200"
      >
        <mat-form-field
          appearance="outline"
          class="w-full sm:flex-1 md:max-w-md"
          subscriptSizing="dynamic"
        >
          <mat-icon matPrefix class="text-gray-400 mr-2">search</mat-icon>
          <mat-label>Pesquisar procurador...</mat-label>
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
          Novo Certificado
        </button>
      </div>

      <!-- Tabela Especializada -->
      <app-procurador-table
        [data]="dataList()"
        [pageSize]="pageSize()"
        [currentPage]="currentPage()"
        [totalElements]="totalElements()"
        [isLoading]="isLoading()"
        (edit)="openModalEdit($event)"
        (deleteItem)="delete($event)"
        (pageChange)="handlePageEvent($event)"
      />
    </div>
  `
})
export default class ProcuradorDisplayPage implements OnInit {
  private readonly procuradorService = inject(ProcuradorService);
  private readonly customDeleteService = inject(CustomDeleteService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  // Signals de estado
  searchTerm = signal<string>('');
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);

  private readonly searchSubject = new Subject<string>();

  // RxResource para busca e listagem reativa
  dataResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      size: this.pageSize(),
      filter: this.searchTerm()
    }),
    stream: ({ params }) => {
      return this.procuradorService.searchFilter(params.page, params.size, params.filter);
    }
  });

  dataList = computed<ProcuradorResponseDTO[]>(() => {
    return (this.dataResource.value()?.content as unknown as ProcuradorResponseDTO[]) ?? [];
  });

  isLoading = this.dataResource.isLoading;

  totalElements = computed(() => {
    return this.dataResource.value()?.page?.totalElements ?? 0;
  });

  constructor() {
    effect(() => {
      const err = this.dataResource.error();
      if (err) {
        this.errorHandlerService.handle(err, 'Pesquisa de Procuradores');
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

  openModalNew(): void {
    const dialogRef = this.dialog.open(ProcuradorFormComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: ProcuradorResponseDTO | boolean) => {
      if (result) {
        this.currentPage.set(0);
        this.dataResource.reload();
      }
    });
  }

  openModalEdit(selectedItem: ProcuradorResponseDTO): void {
    const dialogRef = this.dialog.open(ProcuradorFormComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
      data: selectedItem
    });

    dialogRef.afterClosed().subscribe((result: ProcuradorResponseDTO | boolean) => {
      if (result && typeof result === 'object') {
        this.dataResource.update((currentData: any) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            content: (currentData.content as ProcuradorResponseDTO[]).map((item) =>
              item.id === result.id ? result : item
            )
          };
        });
      }
    });
  }

  delete(item: ProcuradorResponseDTO): void {
    this.customDeleteService.execute(
      () => this.procuradorService.delete(item.id),
      () => {
        this.dataResource.reload();
        this.currentPage.set(0);
      },
      { successMsg: `Procurador "${item.nome}" removido com sucesso!` }
    );
  }
}

