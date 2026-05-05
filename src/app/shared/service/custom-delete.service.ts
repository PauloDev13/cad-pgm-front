import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from './NotificationSnackbar.service';
import { ErrorHandlerService } from './error-handler.service';

type Messages = {
  title?: string;
  message?: string;
  successMsg?: string;
};

@Injectable({
  providedIn: 'root'
})
export class CustomDeleteService {
  private dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlerService = inject(ErrorHandlerService);

  execute(deleteActions: () => Observable<any>, onSuccess: () => void, options?: Messages) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: options?.title ?? 'Remover registro',
        message:
          options?.message ?? 'Esta ação não poderá ser desfeita. Tem certeza que quer prosseguir?'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        deleteActions().subscribe({
          next: (response: any) => {
            const backendMsg = response?.message;
            const fallbackMsg = options?.successMsg ?? 'Registro removido com sucesso!';
            this.notificationService.success(
              backendMsg || fallbackMsg,
              'Exclusão'
            );
            onSuccess();
          },
          error: (err) => {
            this.errorHandlerService.handle(err, 'Excluir');
          }
        });
      }
    });
  }
}
