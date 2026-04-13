import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { ResetPasswordDialogData } from '../../models/auth.model';
import { NotificationService } from '../../../../shared/service/NotificationSnackbar.service';

@Component({
  selector: 'app-temporary-password-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  standalone: true,
  template: `
    <h2 mat-dialog-title class="!text-2xl !font-bold text-blue-800 border-b">
      {{ data.title }}
    </h2>

    <mat-dialog-content>
      <p class="text-gray-600 text-base pt-2 mb-6">
        {{ data.message }}
      </p>
      <div class="bg-gray-100 p-4 rounded-lg flex items-center justify-between border">
        <code class="text-xl font-bold tracking-widest">{{ data.password }}</code>
        <button mat-icon-button (click)="copyPassword(data.password)">
          <mat-icon>content_copy</mat-icon>
        </button>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!pb-4 !pr-4">
      <button
        mat-button
        type="button"
        (click)="onYesClick()"
        class="hover:!bg-red-600
        hover:!text-white
        !border-red-600
        !text-red-600
        !transition duration-400 !ease-in-out"
      >
        OK
      </button>
    </mat-dialog-actions>
  `
})
export class TemporaryPasswordDialogComponent {
  // Injeções
  readonly dialogRef = inject(MatDialogRef<TemporaryPasswordDialogComponent>);
  readonly data = inject<ResetPasswordDialogData>(MAT_DIALOG_DATA);

  // Injeta os serviços utilitários
  private clipboard = inject(Clipboard);
  private notificationService = inject(NotificationService);

  // private toastService = inject(ToastService);

  onYesClick(): void {
    this.dialogRef.close(true);
  }

  copyPassword(password: string) {
    this.clipboard.copy(password);

    this.notificationService.success(
      'Senha copiada para a área de transferência!',
      'Copiar Senha'
    );

    // this.toastService.successLogin(
    //   'Copiar Senha',
    //   'Senha copiada para a área de transferência!'
    // );
  }
}
