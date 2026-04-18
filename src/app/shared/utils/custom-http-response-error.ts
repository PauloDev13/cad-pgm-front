import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../service/NotificationSnackbar.service';

export function customHttpError(err: any, notificationService: NotificationService) {

  // Mensagem padrão caso seja erro de rede (backend fora do ar) ou algo não mapeado
  let messageDefaultErro = 'Erro inesperado ao conectar a API';

  // Verificamos se o erro veio da requisição HTTP
  if (err instanceof HttpErrorResponse) {
    // Tratamento 1: O Spring devolveu um JSON com a propriedade "message"
    if (err.error && typeof err.error.message === 'string') {
      messageDefaultErro = err.error?.message;

      // Tratamento 2: O Spring devolveu apenas uma String simples no corpo da resposta
    } else if (err.error && Array.isArray(err.error.errors)) {
      messageDefaultErro =
        err.error.errors[0].defaultMessage || 'Erro de validação nos dados enviados.';

      // Tratamento 3: Erro de Validação de Múltiplos Campos (@Valid do Spring)
    } else if (err.error && Array.isArray(err.error.errors)) {
      messageDefaultErro =
        err.error.errors[0].defaultMessage || 'Erro de validação nos dados enviados.';
    }
  }
  notificationService.error(messageDefaultErro, 'Register');
}
