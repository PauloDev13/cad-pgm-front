import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/component/main-layout.component';
import { authGuard, publicGuard, roleGuard } from './core/auth/guards/auth.guard';
import { AuthLayoutPage } from './core/auth/pages/auth-layout.page';

export const routes: Routes = [
  // ==========================================
  // 1. ÁREA PÚBLICA (Layout de Autenticação)
  // ==========================================
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutPage,
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        title: 'Login | Gestão de Servidores PGM Natal',
        loadComponent: () => import('./core/auth/component/form-main-login.component')
          .then((m) => m.FormMainLoginComponent)
      },
      {
        path: 'register',
        title: 'Cadastro | Gestão de Servidores PGM Natal',
        loadComponent: () => import('./core/auth/component/form-register-usuario.component')
          .then((m) => m.FormRegisterUsuarioComponent)
      },
      {
        path: 'esqueci-senha',
        title: 'Recuperar Senha | Gestão de Servidores PGM Natal',
        loadComponent: () =>
          import('./core/auth/component/forgot-password.component').then((m) => m.ForgotPasswordComponent)
      },
      {
        path: 'redefinir-senha',
        title: 'Nova Senha | Gestão de Servidores PGM Natal',
        loadComponent: () =>
          import('./core/auth/component/reset-password.component').then((m) => m.ResetPasswordComponent)
      },
      {
        path: 'troca-obrigatoria',
        title: 'Troca de Senha Obrigatória | PGM Natal',
        loadComponent: () => import('./core/auth/component/force-password-change.component').then(m => m.ForcePasswordChangeComponent)
      }
    ]
  },

  // ==========================================
  // 2. ÁREA PRIVADA (Layout Principal do Sistema)
  // ==========================================

  {
    // A Rota Principal agora carrega o Menu Lateral
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // Ninguém passa daqui sem estar logado!
    // Tudo que estiver aqui dentro vai aparecer no <router-outlet> do Menu
    children: [
      {
        // Se acessar localhost:4200 vazio, joga a página inicial
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        title: 'Início | Gestão de Servidores PGM Natal',
        loadComponent: () => import('./features/home/pages/home.page')
      },
      {
        path: 'usuarios',
        title: 'Gestão de Usuários',
        loadComponent: () => import('./features/usuario/pages/usuario-list.page')
      },
      {
        // A sua tela já existente, intacta!
        path: 'servidores',
        title: 'Gestão de Servidores',
        loadComponent: () => import('./features/servidor/pages/servidor-list.page')
      },
      {
        // tela para cadastro, edição e exclusão de cargos
        path: 'cadastro/cargos',
        title: 'Gestão de Cargos',
        // Empilhamos o roleGuard e informamos no 'data' qual o cargo exigido
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/cargo/pages/cargo-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de setores
        path: 'cadastro/setores',
        title: 'Gestão de Setores',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/setor/pages/setor-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de vínculos
        path: 'cadastro/vinculos',
        title: 'Gestão de Vínculos',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/vinculo/pages/vinculo-display.page')
      },
      {
        // tela para cadastro, edição e exclusão status
        path: 'cadastro/status',
        title: 'Gestão de Status',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/status/pages/status-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de procuradores
        path: 'permissoes/procuradores',
        title: 'Gestão de Procuradores',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/procurador/pages/procurador-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de sistemas
        path: 'permissoes/sistemas',
        title: 'Gestão de Sistemas',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/sistema/pages/sistema-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de alias
        path: 'permissoes/alias',
        title: 'Gestão de Alias',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/alias/pages/alias-display.page')
      },
      {
        // tela para visualização de detalhes do servidor
        path: 'servidores/detalhes/:id',
        title: 'Detalhes do servidor',
        loadComponent: () => import('./features/servidor/pages/servidor-detalhes.page')
      },
      {
        path: 'auditoria/relatorio',
        title: 'Relatório de Auditoria',
        loadComponent: () => import('./core/auditoria/pages/audit.page/audit.page')
      }
    ]
  },

  // ==========================================
  // 3. ROTA DE FALLBACK (Qualquer URL inválida)
  // ==========================================

  {
    // Se o usuário digitar qualquer URL que não exista, é expulso para o login
    path: '**',
    redirectTo: 'home'
  }
];
