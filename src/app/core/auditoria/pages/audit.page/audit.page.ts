import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AuditForm, IAuditoriaQueryParams } from '../../models/audit-response.dto';
import { AuditService } from '../../services/audit.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { form } from '@angular/forms/signals';
import { AuditoriaTableComponent } from '../../components/auditoria-table/auditoria-table.component';
import {
  AuditoriaFieldsSearchComponent
} from '../../components/auditoria-fields-search/auditoria-fields-search.component';
import {
  AuditoriaButtonsSearchComponent
} from '../../components/auditoria-buttons-search/auditoria-buttons-search.component';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-audit.page',
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatTableModule,
    MatPaginatorModule, AuditoriaTableComponent, AuditoriaFieldsSearchComponent,
    AuditoriaButtonsSearchComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full h-full overflow-hidden bg-gray-50 p-4 md:p-0 print:h-auto
                print:bg-white print:p-0">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 py-2 px-4 mb-2
                  shrink-0 print:hidden">
        <div class="flex flex-col sm:flex-row justify-between items-center sm:items-center mb-4
                    border-b pb-2 gap-4 sm:gap-0">
          <h1 class="text-2xl font-bold text-blue-800">Relatório de Auditoria</h1>

          <!-- Botões limpar, imprimir e gerar relatório refatorados-->
          <app-auditoria-buttons-search
            (onGenerateReport)="generateReport()"
            (onPrintReport)="printReport()"
            (onCleanFilters)="cleanFilters()"
          />
        </div>
        <!-- Campos usuario, ação, data inicial e data final refatorados-->
        <app-auditoria-fields-search
          [username]="auditForm.username"
          [typeAction]="auditForm.typeAction"
          [startDate]="$any(auditForm.startDate)"
          [endDate]="$any(auditForm.endDate)"
        />
      </div>
      <!-- Tabela relatório de Auditoria refatorada-->
      <app-auditoria-table
        [dataAudit]="dataAudit()"
        [isLoading]="isLoading()"
        [username]="auditFormModel().username"
        [actionType]="auditFormModel().typeAction"
        [dateStart]="auditFormModel().startDate"
        [dateEnd]="auditFormModel().endDate"
        [currentPage]="currentPage()"
        [pageSize]="pageSize()"
        [totalElements]="totalElements()"
        (pageChange)="onPageChange($event)"
      />
    </div>
  `
})
export default class AuditPage {
  private readonly auditoriaService = inject(AuditService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlerService = inject(ErrorHandlerService);

  // SIGNALS DE ESTADO DA TABELA
  pageSize = signal<number>(30);
  currentPage = signal<number>(0);

  auditFormModel = signal<AuditForm>({
    username: '',
    typeAction: '',
    startDate: null,
    endDate: null
  });

  // Formulário
  auditForm = form(this.auditFormModel);

  // Modelo de formulário reativo
  debouncedFormModel = toSignal(
    toObservable(this.auditFormModel).pipe(
      debounceTime(500),
      distinctUntilChanged()
    ),
    { initialValue: this.auditFormModel() }
  );

  constructor() {
    effect(() => {
      const { startDate, endDate } = this.auditFormModel();

      const err = this.auditoriaResource.error();
      if (err) {
        this.errorHandlerService.handle(err, 'Relatório');
      }

      if (startDate && endDate && endDate < startDate) {
        this.notificationService.error(
          'A data final não pode ser menor que a data inicial.', 'Filtro Inválido'
        );
      }
    });
  }

  // Resource que busca todas os registros auditorias
  auditoriaResource = rxResource({
    params: () => {
      const currentModel = this.debouncedFormModel();
      const { startDate, endDate, username, typeAction } = currentModel;

      // Se a data final for maior que a data inicial
      if (startDate && endDate && endDate < startDate) {
        return; // Aborta a requisição!
      }

      // Não permite que requisição de pesquisa no input
      // se o número de caracteres for menor ou igual a 3
      const isUsernameBlocked = username && username.trim().length <= 3;

      // Se for menor ou igual a 2, aborta
      if (isUsernameBlocked) {
        return;
      }

      // Formata das datas usando o método privado formatDateToISO
      const isoStartDate = startDate ? this.formatDateToISO(startDate) : null;
      const isoEndDate = endDate ? this.formatDateToISO(endDate) : null;

      // Monta os objeto com os parâmetros da requisição
      const queryParams: IAuditoriaQueryParams = {
        page: this.currentPage(),
        size: this.pageSize(),
        username,
        typeAction,
        startDate: isoStartDate,
        endDate: isoEndDate
      };
      return queryParams;
    },
    // Faz a requisição
    stream: ({ params }) => {
      return this.auditoriaService.searchAuditFilter(params);
    }
  });

  // Lista de registro de auditoria
  dataAudit = computed(() => {
    return this.auditoriaResource.value()?.content ?? [];
  });

  isLoading = this.auditoriaResource.isLoading;

  totalElements = computed(() => {
    return this.auditoriaResource.value()?.page.totalElements ?? 0;
  });

  // MÉTODO PRINCIPAL DA BUSCA
  generateReport(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage.set(0);
    }
    // const currentModel = this.auditFormModel();
    //
    // // 1. Validação de Datas (Regra de Negócio Frontend)
    // const startDate = currentModel.startDate;
    // const endDate = currentModel.endDate;
    //
    // if (startDate && endDate && endDate < startDate) {
    //   this.notificationService.error(
    //     'A data final não pode ser menor que a data inicial.', 'Filtro Inválido'
    //   );
    //   return; // Aborta a requisição!
    // }
    //
    // this.isLoading.set(true);
    //
    // // 2. Formatação das datas para YYYY-MM-DD
    // const isoStartDate = startDate ? this.formatDateToISO(startDate) : null;
    // const isoEndDate = endDate ? this.formatDateToISO(endDate) : null;
    //
    // // 3. Chamada à API
    // this.auditoriaService.searchAuditFilter({
    //   page: this.currentPage(),
    //   size: this.pageSize(),
    //   username: currentModel.username,
    //   typeAction: currentModel.typeAction,
    //   startDate: isoStartDate,
    //   endDate: isoEndDate
    // })
    //   .pipe(finalize(() => this.isLoading.set(false)))
    //   .subscribe({
    //     next: (response) => {
    //       this.dataAudit.set(response.content);
    //       this.totalElements.set(response.page.totalElements);
    //       this.currentPage.set(response.page.number);
    //     },
    //     error: (err) => this.errorHandlerService.handle(err, 'Relatório')
    //   });
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  cleanFilters() {
    this.auditFormModel.set({
      username: '',
      typeAction: '',
      startDate: null,
      endDate: null
    });
  }

  printReport() {
    window.print();
  }

  // HELPER: Converte objeto Date do JS para "YYYY-MM-DD" exigido pelo Spring
  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
