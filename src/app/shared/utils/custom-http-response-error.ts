import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../service/NotificationSnackbar.service';

export function customHttpError(
  err: any,
  notificationService: NotificationService,
  title: string = 'Atenção' // ✨ Título dinâmico (com um fallback padrão)
) {

  // ========================================================================
  // 🛡PROTEÇÕES DO INTERCEPTOR
  // ========================================================================

  // 1. Ignora o erro se o Interceptor cortou o fluxo retornando EMPTY (ex: 401/403)
  if (err.name === 'EmptyError') {
    return; // Sai em silêncio. A tela vai ser redirecionada para o Login.
  }

  // 2. Ignora se for o nosso erro silencioso (Caso você decida usar o padrão Guardião)
  if (err.message === 'SILENT_ERROR') {
    return; // O Interceptor já mostrou a mensagem de erro de servidor (0, 500, etc).
  }

  // ========================================================================
  // TRADUÇÃO DOS ERROS DO BACKEND
  // ========================================================================

  let messageDefault = 'Erro inesperado ao processar a requisição.';

  if (err instanceof HttpErrorResponse) {

    // O Spring devolveu um JSON padronizado com a propriedade "message"
    if (err.error && typeof err.error.message === 'string') {
      messageDefault = err.error.message;
    }

    // TO Spring devolveu erros de validação do @Valid (array de erros)
    else if (err.error && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
      // Pega a mensagem do primeiro campo que falhou na validação
      messageDefault = err.error.errors[0].defaultMessage || 'Erro de validação nos dados enviados.';
    }

    // O Spring devolveu uma String pura (comum ao usar responseType: 'text')
    else if (typeof err.error === 'string' && err.error.trim() !== '') {
      messageDefault = err.error;
    }

  } else if (err instanceof Error) {
    // Tratamento 4: Erro nativo do JS/Angular (Pode ter vindo do catchError de um Service)
    messageDefault = err.message || messageDefault;
  }

  // ========================================================================
  // EXIBIÇÃO DA NOTIFICAÇÃO
  // ========================================================================
  notificationService.error(messageDefault, title);
}
