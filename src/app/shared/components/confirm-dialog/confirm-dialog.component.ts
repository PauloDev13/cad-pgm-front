import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  standalone: true,
  template: `
    <h2 mat-dialog-title class="!text-2xl !font-bold text-blue-800 border-b">
      {{ data.title }}
    </h2>

    <mat-dialog-content>
      <p class="text-gray-600 text-base pt-2">{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!pb-4 !pr-4">
      <button
        mat-stroked-button
        type="button"
        (click)="onNoClick()"
        class="hover:!text-white
        hover:!bg-blue-500
        !text-blue-500
        !border-blue-500
        !transition duration-400 !ease-in-out"
      >
        NÃO
      </button>

      <button
        mat-stroked-button
        type="button"
        (click)="onYesClick()"
        class="hover:!bg-red-600
        hover:!text-white
        !border-red-600
        !text-red-600
        !transition duration-400 !ease-in-out"
      >
        SIM
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  // Injeções
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
