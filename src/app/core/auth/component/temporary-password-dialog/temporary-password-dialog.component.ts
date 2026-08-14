import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { ResetPasswordDialogData } from '../../models/auth.model';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-temporary-password-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatTooltipModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div mat-dialog-title
         class="!flex !flex-row !justify-between !items-center !w-full !px-6 !pt-5 !pb-3 !m-0 border-b border-gray-200">
      <h2 class="!font-bold !text-lg sm:!text-xl !text-blue-800 !m-0 !p-0 !text-left flex-1">
        {{ data.title }}
      </h2>

      <button
        mat-icon-button
        aria-label="Fechar"
        (click)="onYesClick()"
        class="!w-8 !h-8 !flex !items-center !justify-center !bg-blue-600 hover:!bg-blue-500 !transition-colors !duration-300 !shrink-0 ml-4"
      >
        <mat-icon class="!text-white !scale-90 !leading-none !m-0 !p-0">close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!px-6 !pb-2 !pt-5">
      <div class="flex flex-col w-full sm:min-w-[350px]">
        <p class="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed !text-left">
          {{ data.message }}
        </p>

        <div class="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-200 shadow-inner">
          <code class="text-lg sm:text-xl font-bold tracking-widest text-blue-800 break-all mr-3 select-all">
            {{ data.password }}
          </code>

          <button
            mat-icon-button
            (click)="copyPassword(data.password)"
            matTooltip="Copiar senha"
            class="!text-blue-600 hover:!bg-blue-100 !transition-colors shrink-0"
          >
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions class="!px-6 !pb-6 !pt-4 flex flex-col sm:flex-row sm:justify-end gap-3">

      <button
        mat-flat-button
        type="button"
        (click)="onYesClick()"
        class="w-full sm:w-auto !bg-blue-600 !text-white hover:!bg-blue-700 !transition-transform !duration-300 !ease-in-out hover:!scale-105 !h-12 sm:!h-10"
      >
        OK
      </button>

    </mat-dialog-actions>
  `
})
export class TemporaryPasswordDialogComponent {
  // Injeções
  readonly data = inject<ResetPasswordDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<TemporaryPasswordDialogComponent>);
  private notificationService = inject(NotificationService);

  // Injeta os serviços utilitários
  private clipboard = inject(Clipboard);

  onYesClick(): void {
    this.dialogRef.close(true);
  }

  copyPassword(password: string) {
    this.clipboard.copy(password);

    this.notificationService.success(
      'Senha copiada para a área de transferência!',
      'Senha'
    );
  }
}
