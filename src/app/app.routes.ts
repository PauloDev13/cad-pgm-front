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
        title: 'Cadastro Usuário| Gestão de Servidores PGM Natal',
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
        title: 'Troca de Senha | Gestão de Servidores PGM Natal',
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
        // Se acessar vazio, joga a página inicial
        path: '',
        title: 'Início | Gestão de Servidores PGM Natal',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        title: 'Início | Gestão de Servidores PGM Natal',
        loadComponent: () => import(
          './features/dashboard/components/dashboard.component/dashboard.component')
        // loadComponent: () => import('./features/home/pages/home.page')
      },
      {
        path: 'usuarios',
        title: 'Usuários | Gestão de Servidores PGM Natal',
        loadComponent: () => import('./features/usuario/pages/usuario-list.page')
      },
      {
        // A sua tela já existente, intacta!
        path: 'servidores',
        title: 'Servidores | Gestão de Servidores PGM Natal',
        loadComponent: () => import('./features/servidor/pages/servidor-list.page')
      },
      {
        // tela para cadastro, edição e exclusão de cargos
        path: 'cadastros/cargos',
        title: 'Cargos  | Gestão de Servidores PGM Natal',
        // Empilhamos o roleGuard e informamos no 'data' qual o cargo exigido
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/cargo/pages/cargo-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de setores
        path: 'cadastros/setores',
        title: 'Setores  | Gestão de Servidores PGM Natal',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/setor/pages/setor-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de vínculos
        path: 'cadastros/vinculos',
        title: 'Vínculos | Gestão de Servidores PGM Natal',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/vinculo/pages/vinculo-display.page')
      },
      {
        // tela para cadastro, edição e exclusão status
        path: 'cadastros/status',
        title: 'Status | Gestão de Servidores PGM Natal',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/status/pages/status-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de procuradores
        path: 'permissoes/procuradores',
        title: 'Procuradores | Gestão de Servidores PGM Natal',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/procurador/pages/procurador-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de sistemas
        path: 'permissoes/sistemas',
        title: 'Sistemas | Gestão de Servidores PGM Natal',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/sistema/pages/sistema-display.page')
      },
      {
        // tela para cadastro, edição e exclusão de alias
        path: 'permissoes/alias',
        title: 'Alias (E-mails) | Gestão de Servidores PGM Natal',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadComponent: () => import('./features/alias/pages/alias-display.page')
      },
      {
        path: 'relatorios/auditoria',
        title: 'Relatório Auditoria | Gestão de Servidores PGM Natal',
        loadComponent: () => import('./core/auditoria/pages/audit.page/audit.page')
      },
      {
        path: 'relatorios/aniversariantes',
        title: 'Lista Aniversariantes | Gestão de Servidores PGM Natal',
        loadComponent: () => import('./features/relatorios/components/aniversariantes/aniversariantes.component')
      },
      {
        // tela para visualização de detalhes do servidor
        path: 'servidores/detalhes/:id',
        title: 'Detalhes do servidor | Gestão de Servidores PGM Natal',
        loadComponent: () => import('./features/servidor/pages/servidor-detalhes.page')
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
