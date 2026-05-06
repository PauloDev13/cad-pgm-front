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
import { form, FormField, minLength } from '@angular/forms/signals';
import { FieldWrapperComponent } from '../../../../shared/layout/component/field-wrapper.component';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-audit.page',
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatTableModule,
    MatPaginatorModule, FormField, FieldWrapperComponent, CustomSelectComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full h-[calc(100vh-64px)] bg-gray-50 p-4 md:p-6 print:h-auto print:bg-white print:p-0">

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 shrink-0 print:hidden">
        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h1 class="text-xl font-bold text-blue-800">Relatório de Auditoria</h1>

          <div class="flex gap-2">
            <button mat-stroked-button (click)="cleanFilters()">Limpar</button>
            <button mat-stroked-button color="primary" (click)="printReport()">
              <mat-icon>print</mat-icon>
              Imprimir
            </button>
            <button mat-flat-button color="primary" (click)="generateReport(true)">
              <mat-icon>search</mat-icon>
              Gerar Relatório
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Usuário</mat-label>
            <input matInput [formField]="auditForm.username" placeholder="Ex: paulo.morais">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
            <mat-label>Tipo de Ação</mat-label>
            <mat-select [formField]="auditForm.typeAction">
              <mat-option value="">Todas</mat-option>
              @for (option of actionOptions; track option.value) {
                <mat-option [value]="option.value">{{ option.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Data Inicial</mat-label>
            <input matInput [matDatepicker]="pickerStart" [formField]="auditForm.startDate">
            <mat-datepicker-toggle matIconSuffix [for]="pickerStart"></mat-datepicker-toggle>
            <mat-datepicker #pickerStart></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Data Final</mat-label>
            <input matInput [matDatepicker]="pickerEnd" [formField]="auditForm.endDate">
            <mat-datepicker-toggle matIconSuffix [for]="pickerEnd"></mat-datepicker-toggle>
            <mat-datepicker #pickerEnd></mat-datepicker>
          </mat-form-field>
        </div>
      </div>

      <div
        class="flex flex-col flex-1 min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm relative print:shadow-none print:border-none print:overflow-visible">

        <div class="overflow-auto w-full flex-1 print:overflow-visible">

          <div class="hidden print:block mb-4 text-center border-b pb-2">
            <h2 class="text-2xl font-bold uppercase">Relatório de Auditoria</h2>
            <p class="text-sm text-gray-500">Impresso em: {{ auditFormModel().startDate | date:'dd/MM/yyyy' }}
              a {{ auditFormModel().endDate | date:'dd/MM/yyyy' }}</p>
          </div>

          <table mat-table [dataSource]="dadosAuditoria()" class="w-full">

            <ng-container matColumnDef="dateHourAction">
              <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-800">Data / Hora</th>
              <td mat-cell *matCellDef="let row" class="text-gray-600 whitespace-nowrap">
                {{ row.dateHourAction | date:'dd/MM/yyyy HH:mm:ss' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-800">Usuário</th>
              <td mat-cell *matCellDef="let row" class="font-medium text-gray-800">{{ row.username }}</td>
            </ng-container>

            <ng-container matColumnDef="typeAction">
              <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-800 text-center">Ação</th>
              <td mat-cell *matCellDef="let row" class="text-center">
            <span class="px-2 py-1 text-xs font-bold rounded-full"
                  [ngClass]="{
                    'bg-green-100 text-green-800': row.typeAction === 'INSERT',
                    'bg-blue-100 text-blue-800': row.typeAction === 'UPDATE',
                    'bg-red-100 text-red-800': row.typeAction === 'DELETE'
                  }">
              {{ row.typeAction }}
            </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="affectedEntity">
              <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-800">Registro</th>
              <td mat-cell *matCellDef="let row" class="text-gray-600">{{ row.affectedEntity }}</td>
            </ng-container>

            <ng-container matColumnDef="details">
              <th mat-header-cell *matHeaderCellDef class="font-semibold text-gray-800">Detalhes Técnicos</th>
              <td mat-cell *matCellDef="let row" class="text-gray-500 text-sm max-w-xs truncate" [title]="row.details">
                {{ row.details }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"
                class="bg-gray-50 border-b-2 border-gray-300 print:bg-white print:border-black"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"
                class="hover:bg-blue-50 transition-colors border-gray-100 print:border-gray-300"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell p-8 text-center text-gray-500" [colSpan]="displayedColumns.length">
                Nenhum registro de auditoria encontrado para os filtros informados.
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator
          class="border-t border-gray-200 shrink-0 print:hidden"
          [length]="totalElements()"
          [pageSize]="pageSize()"
          [pageIndex]="currentPage()"
          [pageSizeOptions]="[20, 50, 100]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </div>
    </div>
  `
})
export default class AuditPage {
  private readonly auditoriaService = inject(AuditService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlerService = inject(ErrorHandlerService);

  // ✨ SIGNALS DE ESTADO DA TABELA
  dadosAuditoria = signal<AuditResponseDTO[]>([]);
  isLoading = signal<boolean>(false);
  totalElements = signal<number>(0);
  pageSize = signal<number>(20);
  currentPage = signal<number>(0);

  // Configuração das colunas da tabela
  displayedColumns = ['dateHourAction', 'username', 'typeAction', 'affectedEntity', 'details'];

  // Opções para o Select de Ação
  actionOptions = [
    { value: 'INSERT', label: 'Criação (Insert)' },
    { value: 'UPDATE', label: 'Atualização (Update)' },
    { value: 'DELETE', label: 'Exclusão (Delete)' }
  ];

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
          this.dadosAuditoria.set(response.content);
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
