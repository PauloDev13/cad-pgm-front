import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { IAuthResponse } from '../models/auth.model';

// Protege as rotas privadas (Exige estar logado)
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const user: IAuthResponse | null = authService.currentUser();
  const router = inject(Router);

  if (user) {
    // Se ele precisa trocar a senha e tentar ir para qualquer lugar
    // que não seja a tela de troca, nós o bloqueamos.
    if (user.forcePasswordChange && !state.url.includes('/auth/troca-obrigatoria')) {
      router.navigate(['/auth/troca-obrigatoria']).then();
      return false;
    }
    // Se o usuário está logado e sem a necessidade de trocar a senha,
    // acessa a aplicação
    return true;
  }

  // Se não tem, chuta o intruso para o login
  router.navigate(['/auth/login']).then();
  return false;
};

// Protege a tela de Login (Impede logados de verem o login)
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user: IAuthResponse | null = authService.currentUser();

  if (user) {
    // Precisa trocar a senha E já está na rota certa.
    // Ação: Deixa ele renderizar a tela.
    if (user.forcePasswordChange && state.url.includes('/auth/troca-obrigatoria')) {
      return true;
    }

    // Precisa trocar a senha, mas está tentando acessar o /login ou /register.
    // Ação: Sequestra de volta para a troca obrigatória.
    if (user.forcePasswordChange) {
      router.navigate(['/auth/troca-obrigatoria']).then();
      return false;
    }

    // Está logado normalmente e a senha está em dia.
    // Ação: Expulsa do módulo público e manda para a Home.
    router.navigate(['/home']).then();
    return false;
  }
  // Não tem usuário logado.
  // Ação: Acesso livre às rotas públicas (Login, Register).
  return true;

};

// Verifica se o usuário tem a permissão necessária
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Pega qual é a permissão que a rota exige (vamos configurar isso nas rotas no passo 2)
  const expectedRole = route.data['role'];

  // Pega o usuário logado
  const user = authService.currentUser();

  // Se por algum motivo não tiver usuário, bloqueia
  if (!user) return false;

  // Verifica se dentro do array de permissões do usuário existe a permissão exigida
  const hasPermission = user.roles.some((p) => p === expectedRole);

  if (hasPermission) {
    return true; // Pode entrar!
  }

  // Se não tiver a permissão, dá um aviso e joga de volta para Home
  alert('Acesso Negado: Você não tem permissão de Administrador para acessar esta tela.');
  router.navigate(['/home']).then();
  return false;
};
