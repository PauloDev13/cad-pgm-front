import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { AuditForm, AuditResponseDTO } from '../../models/audit-response.dto';
import { finalize } from 'rxjs';
import { AuditService } from '../../services/audit.service';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../../shared/service/error-handler.service';
import { form, minLength } from '@angular/forms/signals';
import { AuditoriaTableComponent } from '../../components/auditoria-table/auditoria-table.component';
import {
  AuditoriaFieldsSearchComponent
} from '../../components/auditoria-fields-search/auditoria-fields-search.component';
import {
  AuditoriaButtonsSearchComponent
} from '../../components/auditoria-buttons-search/auditoria-buttons-search.component';

@Component({
  selector: 'app-audit.page',
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatTableModule,
    MatPaginatorModule, AuditoriaTableComponent, AuditoriaFieldsSearchComponent, AuditoriaButtonsSearchComponent
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
  dataAudit = signal<AuditResponseDTO[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  pageSize = signal<number>(15);
  currentPage = signal<number>(0);

  auditFormModel = signal<AuditForm>({
    username: '',
    typeAction: '',
    startDate: null,
    endDate: null
  });

  auditForm = form(this.auditFormModel, (path: any) => {
    minLength(path.username, 5, { message: 'O Username deve ter no mínimo 5 caracteres' });
  });

  constructor() {
    this.generateReport();
  }

  // MÉTODO PRINCIPAL DA BUSCA
  generateReport(resetPage: boolean = false) {
    if (resetPage) {
      this.currentPage.set(0);
    }

    const currentModel = this.auditFormModel();

    // 1. Validação de Datas (Regra de Negócio Frontend)
    const startDate = currentModel.startDate;
    const endDate = currentModel.endDate;

    if (startDate && endDate && endDate < startDate) {
      this.notificationService.error(
        'A data final não pode ser menor que a data inicial.', 'Filtro Inválido'
      );
      return; // Aborta a requisição!
    }

    this.isLoading.set(true);

    // 2. Formatação das datas para YYYY-MM-DD
    const isoStartDate = startDate ? this.formatDateToISO(startDate) : null;
    const isoEndDate = endDate ? this.formatDateToISO(endDate) : null;

    // 3. Chamada à API
    this.auditoriaService.searchAuditFilter(
      this.currentPage(),
      this.pageSize(),
      currentModel.username,
      currentModel.typeAction,
      isoStartDate,
      isoEndDate
    )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.dataAudit.set(response.content);
          this.totalElements.set(response.page.totalElements);
          this.currentPage.set(response.page.number);
        },
        error: (err) => this.errorHandlerService.handle(err, 'Relatório')
      });
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.generateReport();
  }

  cleanFilters() {
    this.auditFormModel.set({
      username: '',
      typeAction: '',
      startDate: null,
      endDate: null
    });
    this.generateReport(true); // Busca tudo limpo e volta para página 1
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
