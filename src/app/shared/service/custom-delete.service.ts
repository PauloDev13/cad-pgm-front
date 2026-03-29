import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../core/services/toast.service';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../components/confirm-dialog.component/confirm-dialog.component';

type Messages = {
  title?: string;
  message?: string;
  successMsg?: string;
  errorMsg?: string;
};

@Injectable({
  providedIn: 'root',
})
export class CustomDeleteService {
  private dialog = inject(MatDialog);
  private readonly toastService = inject(ToastService);

  execute(deleteActions: () => Observable<void>, onSuccess: () => void, options?: Messages) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: options?.title ?? 'Remover registro',
        message:
          options?.message ?? 'Esta ação não poderá ser desfeita. Tem certeza que quer prosseguir?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        deleteActions().subscribe({
          next: () => {
            this.toastService.success(options?.successMsg ?? 'Registro removido com sucesso!');
            onSuccess();
          },
          error: () => {
            console.log('Erro ao remover registro');
            this.toastService.error(options?.errorMsg ?? 'Erro ao remover registro!');
          },
        });
      }
    });
  }
}
