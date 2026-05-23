import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MESES_DO_ANO } from '../../models/aniversariente.model';


@Component({
  selector: 'app-mes-aniversario-modal',
  imports: [
    MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule
  ],
  standalone: true,
  template: `
    <div mat-dialog-title class="!flex !justify-between !items-center !px-6 !pt-4 !pb-2 !m-0">
      <h2 mat-dialog-title
          class="!font-bold !text-lg sm:!text-xl !text-blue-800 !m-0 !p-0 !text-left flex-1">
        Relatório de Aniversariantes
      </h2>
    </div>

    <mat-dialog-content class="pt-6">
      <p class="mb-4 text-base text-gray-600">Selecione o mês de referência.</p>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
        <mat-label>Mês</mat-label>
        <mat-select [value]="selectedMonth()" (selectionChange)="selectedMonth.set($event.value)">
          @for (month of months; track month.id) {
            <mat-option [value]="month.id">{{ month.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pb-4 pr-4">
      <button mat-button mat-dialog-close class="text-gray-600">Cancelar</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!selectedMonth()"
        (click)="confirm()">
        Gerar Relatório
      </button>
    </mat-dialog-actions>
  `
})
export class MesAniversarioModalComponent {
  dialogRef = inject(MatDialogRef<MesAniversarioModalComponent>);

  months = MESES_DO_ANO;

  selectedMonth = signal<number | null>(null);

  confirm() {
    this.dialogRef.close(this.selectedMonth());
  }
}
