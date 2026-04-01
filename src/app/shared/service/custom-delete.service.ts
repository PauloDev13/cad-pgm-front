import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../core/services/toast.service';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../components/confirm-dialog.component/confirm-dialog.component';
import { ApiErrorHandlerService } from './api-error-handler.service';

type Messages = {
  title?: string;
  message?: string;
  successMsg?: string;
  // errorMsg?: string;
};

@Injectable({
  providedIn: 'root',
})
export class CustomDeleteService {
  private dialog = inject(MatDialog);
  private readonly toastService = inject(ToastService);
  private readonly errorHandlerService = inject(ApiErrorHandlerService);

  execute(deleteActions: () => Observable<any>, onSuccess: () => void, options?: Messages) {
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
          next: (response: any) => {
            const backendMsg = response?.message;
            const fallbackMsg = options?.successMsg ?? 'Registro removido com sucesso!';
            this.toastService.success(backendMsg || fallbackMsg);
            onSuccess();
          },
          error: (err) => {
            console.log('Erro ao remover registro');
            this.errorHandlerService.errorHandler(err);
          },
        });
      }
    });
  }
}
