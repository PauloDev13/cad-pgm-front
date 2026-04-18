import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './NotificationSnackbar.service';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorHandlerService {
  private readonly notificationService = inject(NotificationService);

  errorHandler(error: any) {
    // Mensagem padrão caso seja erro de rede (backend fora do ar) ou algo não mapeado
    let messageDefaultErro = 'Erro inesperado ao conectar a API';

    // Verificamos se o erro veio da requisição HTTP
    if (error instanceof HttpErrorResponse) {

      // Tratamento 1: O Spring devolveu um JSON com a propriedade "message"
      if (error.error && typeof error.error.message === 'string') {
        messageDefaultErro = error.error.message;

        // Tratamento 2: O Spring devolveu apenas uma String simples no corpo da resposta
      } else if (error.error && Array.isArray(error.error.errors)) {
        messageDefaultErro =
          error.error.errors[0].defaultMessage || 'Erro de validação nos dados enviados.';
      }

      //  DECISÃO ARQUITETURAL
      // Se for um erro de Proibido (403) ou Conflito (409 - comum em exclusão com vínculo)
      if (error.status === 403 || error.status === 409) {
        this.notificationService.error(
          messageDefaultErro,
          'EXCLUSÃO NEGADA'
        );
        return;
      }
    }

    this.notificationService.error(
      messageDefaultErro,
      'Exclusão'
    );

  }
}
