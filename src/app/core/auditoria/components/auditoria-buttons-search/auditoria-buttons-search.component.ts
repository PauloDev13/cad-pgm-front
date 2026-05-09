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
    <div class="flex flex-wrap gap-2 w-full sm:w-auto">
      <button
        mat-stroked-button
        (click)="onCleanFilters.emit()"
        class="flex-1 sm:flex-none">
        Limpar
      </button>
      <button
        mat-stroked-button
        color="primary"
        (click)="onPrintReport.emit()"
        class="flex-1 sm:flex-none">
        <mat-icon>print</mat-icon>
        Imprimir
      </button>
      <button
        mat-flat-button
        color="primary"
        (click)="onGenerateReport.emit(true)"
        class="w-full sm:w-auto">
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
