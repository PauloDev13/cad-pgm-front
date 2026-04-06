import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Protege as rotas privadas (Exige estar logado)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se tem usuário no Signal, a catraca está liberada!
  if (authService.currentUser()) {
    return true;
  }

  // Se não tem, chuta o intruso para o login
  router.navigate(['/login']).then();
  return false;
};

// Protege a tela de Login (Impede logados de verem o login)
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // Se tem usuário no Signal, não tem motivo para ver o login. Joga pra home!
  if (authService.currentUser()) {
    router.navigate(['/home']).then();
    return false;
  }

  // Se está vazio, pode ver o formulário de login tranquilamente
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
  const hasPermission = user.permissions.some((p) => p.description === expectedRole);

  if (hasPermission) {
    return true; // Pode entrar!
  }

  // Se não tiver a permissão, dá um aviso e joga de volta pra Home
  alert('Acesso Negado: Você não tem permissão de Administrador para acessar esta tela.');
  router.navigate(['/home']).then();
  return false;
};
