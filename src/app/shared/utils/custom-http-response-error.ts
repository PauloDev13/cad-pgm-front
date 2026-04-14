import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../service/NotificationSnackbar.service';

export function customHttpError(error: any) {
  const notificationService = inject(NotificationService);

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

      // Tratamento 3: Erro de Validação de Múltiplos Campos (@Valid do Spring)
    } else if (error.error && Array.isArray(error.error.errors)) {
      messageDefaultErro =
        error.error.errors[0].defaultMessage || 'Erro de validação nos dados enviados.';
    }
  }
  notificationService.error(messageDefaultErro, 'Register');
}
