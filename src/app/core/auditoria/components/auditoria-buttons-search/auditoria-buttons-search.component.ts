import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auditoria-buttons-search',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-wrap gap-4 w-full sm:w-auto">
      <button
        mat-stroked-button
        (click)="onCleanFilters.emit()"
        class="flex-1 sm:flex-none w-full sm:w-auto !border-blue-600 !text-blue-600
              !transition-transform duration-300 hover:!scale-105 order-3 sm:order-1">
        Limpar
        <mat-icon>delete_sweep</mat-icon>
      </button>
      <button
        mat-stroked-button
        (click)="onPrintReport.emit()"
        class="flex-1 sm:flex-none w-full sm:w-auto !border-blue-600 !text-blue-600
              !transition-transform duration-300 hover:!scale-105 order-2 sm:order-2">
        <mat-icon>print</mat-icon>
        Imprimir
      </button>
      <button
        mat-flat-button
        (click)="onGenerateReport.emit(true)"
        class="w-full sm:w-auto sm:gap-2 !transition-transform duration-300 hover:!scale-105
              order-1 sm:order-3">
        <mat-icon>search</mat-icon>
        Gerar Relatório
      </button>
    </div>
  `
})
export class AuditoriaButtonsSearchComponent {
  onCleanFilters = output<void>();
  onPrintReport = output<void>();
  onGenerateReport = output<boolean>();
}
