import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, throwError } from 'rxjs';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { AuthStore } from '../store/auth.store';
import { isTokenExpired } from '../utils/token.utils';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeções de dependência
  const authStore = inject(AuthStore);
  const notificationService = inject(NotificationService);

  // Pega o usuário logado
  const token: string | null = authStore.token();
  const isLoginRequest = req.url.includes('/auth/login');
  const isPublicAuthRequest =
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password') ||
    req.url.includes('/auth/validate-reset-token');

  // =========================================================================
  // 1. VERIFICAÇÃO PROATIVA (PRÉ-REQUISIÇÃO)
  // Se existe token, mas ele já expirou, aborta a requisição antes de ir à rede.
  // Evita tráfego desnecessário e contorna o erro de CORS do backend (status 0).
  // =========================================================================
  if (token && !isLoginRequest && !isPublicAuthRequest) {
    if (isTokenExpired(token)) {
      authStore.forceLogout();
      notificationService.warning('Sua sessão expirou. Faça login novamente', 'Sessão Expirada');
      return EMPTY;
    }
  }

  // Clona a requisição anexando o cabeçalho Authorization
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Cria uma variável que recebe uma cópia requisição (Req e imutável)
  // let authReq = req;

  // Se houver token, anexa em TODAS as requisições (Java + Python)
  // if (token) {
  //   // Faz um clone da requisição e passar o token no cabeçalho com o prefixo "Bearer"
  //   authReq = req.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   });
  // }

  // const isLoginRequest = req.url.includes('/auth/login');

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.error instanceof Blob) {
        try {
          error.error.text().then((text: string) => {
            notificationService.warning('Servidor sem foto cadastrada ' + text);
          });
        } catch {
          notificationService.warning('Ocorreu um erro inesperado');
        }
        notificationService.warning('Servidor sem foto cadastrada');
      }

      // =========================================================================
      // 2. SESSÃO EXPIRADA NO BACKEND (Status 401)
      // Ocorre quando o backend invalida o token ou expira no relógio do servidor
      // =========================================================================
      if (error.status === 401 && !isLoginRequest) {
        // Sai da aplicação
        authStore.forceLogout();
        // Exibe mensagem na tela
        notificationService.warning('Sua sessão expirou. Faça login novamente', 'Sessão Expirada');

        return EMPTY;
      }

      // =========================================================================
      // 3. FALHA DE REDE / CORS (Status 0)
      // Se status === 0 e o token do usuário expirou (ou foi invalidado),
      // significa que o backend rejeitou a requisição e o navegador omitiu o 401.
      // =========================================================================
      if (error.status === 0 && token && isTokenExpired(token, 0)) {
        authStore.forceLogout();
        notificationService.warning('Sua sessão expirou. Faça login novamente', 'Sessão Expirada');
        return EMPTY;
      }

      // =========================================================================
      // 4. ACESSO NEGADO / PERMISSÃO INSUFICIENTE (Status 403)
      // =========================================================================
      if (error.status === 403) {
        notificationService.warning(
          'Você não tem permissão para realizar esta operação.',
          'Acesso Negado'
        );

        Object.defineProperty(error, 'globalHandled', { value: true });

        return throwError(() => error);
      }

      // =========================================================================
      // 5. LIMITE DE PAYLOAD (Status 413)
      // =========================================================================
      if (error.status === 413) {
        notificationService.warning(
          'Os arquivos enviados excedem o limite máximo permitido de 20 MB',
          'Tamanho de arquivo');

        // Criamos uma propriedade 'globalHandled' para avisar o restante do sistema.
        Object.defineProperty(error, 'globalHandled', { value: true });
      }

      // =========================================================================
      // 6. FALHA GENÉRICA DE CONEXÃO / GATEWAY (Status 0 ou 502 legítimos)
      // =========================================================================
      if (error.status === 0 || error.status === 502) {
        notificationService.warning(
          'Não foi possível conectar ao servidor. Verifique sua ' +
          'conexão com a internet</br> ou tente novamente.', 'Conexão');

        // Criamos uma propriedade 'globalHandled' para avisar o restante do sistema.
        Object.defineProperty(error, 'globalHandled', { value: true });
      }

      // =========================================================================
      // 7. ERRO INTERNO DO SERVIDOR (Status 500)
      // =========================================================================
      if (error.status === 500) {
        notificationService.warning(
          'Erro interno no servidor. Contate o administrador' +
          '</br>ou tente novamente.', 'Conexão');

        Object.defineProperty(error, 'globalHandled', { value: true });
      }

      // Não importa se o Interceptor mostrou a mensagem ou não,
      // o erro sempre é repassado para frente para que o componente
      // que fez a requisição possa exibir o error e modificar o valor
      // de alguma variável, como isLoading
      return throwError(() => error);
    })
  );
};
