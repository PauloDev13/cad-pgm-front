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
    // 1. Ignora erros de Interceptors (fluxos já cortados/silenciados ou já tratados globalmente)
    if (!err || err.name === 'EmptyError' || err.message === 'SILENT_ERROR' || err.globalHandled) return;

    let messageDefault = 'Erro inesperado ao processar a requisição.';

    if (err instanceof HttpErrorResponse) {
      if (err.error) {
        if (typeof err.error.message === 'string' && err.error.message.trim() !== '') {
          messageDefault = err.error.message;
        } else if (typeof err.error.detail === 'string' && err.error.detail.trim() !== '') {
          // Suporte ao ProblemDetail do Spring Boot 3
          messageDefault = err.error.detail;
        } else if (Array.isArray(err.error.errors) && err.error.errors.length > 0) {
          // Suporte ao Spring Bean Validation (@Valid)
          const fieldErrors = err.error.errors
            .map((e: any) => e.defaultMessage || e.message || `${e.field}: inválido`)
            .filter(Boolean);
          messageDefault = fieldErrors.length > 0 ? fieldErrors.join('<br>') : 'Erro de validação nos campos.';
        } else if (typeof err.error === 'string' && err.error.trim() !== '') {
          messageDefault = err.error;
        }
      } else if (err.statusText) {
        messageDefault = `Erro ${err.status}: ${err.statusText}`;
      }
    } else if (err instanceof Error) {
      // Erro nativo ou exceção local
      messageDefault = err.message || messageDefault;
    } else if (typeof err === 'string') {
      messageDefault = err;
    }

    // Dispara o Toast/Snackbar centralizado
    this.notificationService.error(messageDefault, title);
  }
}

