import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogData } from '../../model/confirm-dialog-data.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div mat-dialog-title class="!flex !justify-between !items-center !px-6 !pt-4 !pb-2 !m-0">
      <h2 mat-dialog-title
          class="!font-bold !text-lg sm:!text-xl !text-blue-800 !m-0 !p-0 !text-left flex-1">
        {{ data.title }}
      </h2>

      <button
        mat-icon-button
        mat-dialog-close
        aria-label="Fechar"
        class="!w-8 !h-8 !flex !items-center !justify-center !bg-blue-600 hover:!bg-blue-500
              !transition-colors !duration-300"
      >
        <mat-icon class="!text-white !scale-90 !leading-none !m-0 !p-0">close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!px-6 !pb-2 !pt-2">
      <div class="flex flex-col w-full sm:min-w-[350px]">
        <p [innerHTML]="data.message" class="text-gray-600 text-base m-0 leading-relaxed"></p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions class="!px-6 !pb-6 !pt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
      <button
        mat-flat-button
        type="button"
        (click)="onNoClick()"
        class="w-full sm:w-auto !border-blue-600 !text-white hover:!bg-blue-600
              hover:!text-white !transition-all !duration-300 !ease-in-out
              hover:!scale-105 !h-12 sm:!h-10 order-2 sm:order-1"
      >
        NÃO
      </button>

      <button
        mat-flat-button
        type="button"
        (click)="onYesClick()"
        class="w-full sm:w-auto !bg-red-500 !text-white hover:!bg-red-600 !transition-transform
              !duration-300 !ease-in-out hover:!scale-105 !h-12 sm:!h-10 order-1 sm:order-2"
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
