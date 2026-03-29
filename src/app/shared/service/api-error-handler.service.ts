import { inject, Injectable } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiErrorHandlerService {
  private readonly toastService = inject(ToastService);

  errorHandler(error: any) {
    // O seu excelente bloco de tratamento de erro do Spring
    let messageDefaultErro = 'Erro inesperado ao conectar a API';

    if (error instanceof HttpErrorResponse) {
      if (error.error && typeof error.error.message === 'string') {
        messageDefaultErro = error.error.message;
      } else if (error.error && Array.isArray(error.error.errors)) {
        messageDefaultErro =
          error.error.errors[0].defaultMessage || 'Erro de validação nos dados enviados.';
      }
    }

    this.toastService.error(messageDefaultErro);
  }
}
