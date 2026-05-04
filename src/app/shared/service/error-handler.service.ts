import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './NotificationSnackbar.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly notificationService = inject(NotificationService);

  // Recebe o erro e um título dinâmico
  handle(err: any, title: string = 'Atenção') {
    // 1. Ignora erros de Interceptors (fluxos já cortados/silenciados)
    if (err.name === 'EmptyError' || err.message === 'SILENT_ERROR') return;

    let messageDefault = 'Erro inesperado ao processar a requisição.';

    if (err instanceof HttpErrorResponse) {
      if (err.error && typeof err.error.message === 'string') {
        messageDefault = err.error.message;
      } else if (err.error && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
        messageDefault = err.error.errors[0].defaultMessage || 'Erro de validação.';
      } else if (typeof err.error === 'string' && err.error.trim() !== '') {
        messageDefault = err.error;
      }
    } else if (err instanceof Error) {
      // Erro nativo gerado pelo throwError no Service
      messageDefault = err.message || messageDefault;
    }

    // Dispara o Toast/Snackbar centralizado
    this.notificationService.error(messageDefault, title);
  }
}
