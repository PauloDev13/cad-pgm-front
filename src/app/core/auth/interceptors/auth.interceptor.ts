import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ILoggedUser } from '../models/auth.model';
import { catchError, EMPTY, throwError } from 'rxjs';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeções de dependência
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  // Pega o usuário logado
  const user: ILoggedUser | null = authService.currentUser();

  // Cria uma variável que recebe uma cópia requisição (Req e imutável)
  let authReq = req;

  // Se houver usuário logado e token
  if (user && user.token) {
    // Faz um clone da requisição e passar o token no cabeçalho com o prefixo "Bearer"
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
  }

  const isLoginRequest = req.url.includes('/auth/login');

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // =========================================================================
      // 1. SESSÃO EXPIRADA (Status 401 e 403)
      // O Interceptor SÓ atua se NÃO for uma requisição de login!
      // =========================================================================
      if ((error.status === 401 || error.status === 403) && !isLoginRequest) {
        // Sai da aplicação
        authService.logout();

        // Exibe mensagem na tela
        notificationService.warning('Sua sessão expirou. Faça login novamente');

        // Direciona para a tela de login
        router.navigate(['/auth/login']).then();

        return EMPTY;
      }

      if (error.status === 0 || error.status === 502) {
        notificationService.warning(
          'Não foi possível conectar ao servidor. Verifique sua ' +
          'conexão com a internet</br> ou tente novamente.', 'Conexão');

        // Criamos uma propriedade 'globalHandled' para avisar o restante do sistema.
        Object.defineProperty(error, 'globalHandled', { value: true });
        
        // Retornando EMPTY, o fluxo do erro é cortado não repassando o erro para frente
        return EMPTY;
      }

      if (error.status === 500) {
        notificationService.warning(
          'Erro interno no servidor. Catate o administrador' +
          '</br>ou tente novamente.', 'Conexão');

        Object.defineProperty(error, 'globalHandled', { value: true });

        // Retornando EMPTY, o fluxo do erro é cortado não repassando o erro para frente
        return EMPTY;
      }

      // Não importa se o Interceptor mostrou a mensagem ou não,
      // o erro sempre é repassado para frente para que o componente
      // que fez a requisição possa exibir o error e modificar o valor
      // de alguma variável, como isLoading
      return throwError(() => error);
    })
  );
};
