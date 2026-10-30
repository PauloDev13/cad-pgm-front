import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MESES_DO_ANO } from '../../../models/aniversariente.model';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-mes-aniversario-modal',
  imports: [
    MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIcon, MatIcon
  ],
  standalone: true,
  template: `
    <div class="flex justify-between items-center pr-6 pt-0 pb-0 border-gray-300 border-b">
      <h2
        mat-dialog-title
        class="!font-bold !text-lg !text-blue-700 !m-0 !flex !items-center">
        <mat-icon class="!mr-1">cake</mat-icon>
        Relatório de Aniversariantes
      </h2>
      <button
        mat-icon-button
        mat-dialog-close
        class="!w-7 !h-7 !flex !items-center !justify-center !bg-blue-600 hover:!bg-blue-500
        !text-white !rounded-full"
      >
        <mat-icon class="!scale-70">close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!pt-4 !flex !flex-col gap-0">
      <p class="mb-2 text-base text-gray-600">Selecione o mês de referência</p>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
        <mat-label>Mês</mat-label>
        <mat-select [value]="selectedMonth()" (selectionChange)="selectedMonth.set($event.value)">
          @for (month of months; track month.id) {
            <mat-option [value]="month.id">{{ month.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions
      align="end"
      class="!px-6 !py-3 !mt-4 bg-gray-50 !border-t !border-gray-300">
      <button
        mat-button
        mat-dialog-close
        class="!rounded-3xl text-gray-600">
        Cancelar
      </button>
      <button
        mat-flat-button
        class="!rounded-3xl"
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
