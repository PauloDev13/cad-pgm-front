import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/component/main-layout.component';
import { authGuard, publicGuard, roleGuard } from './core/auth/services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    title: 'Login | Gestão de Servidores PGM Natal',
    canActivate: [publicGuard], // Protegemos o login aqui!
    loadComponent: () => import('./core/auth/pages/login.page').then((c) => c.LoginPage)
  },

  {
    path: 'auth/esqueci-senha',
    title: 'Recuperar Senha | Gestão de Servidores PGM Natal',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./core/auth/pages/forgot-password.page').then((m) => m.ForgotPasswordPage)
  },
  {
    path: 'auth/redefinir-senha',
    title: 'Nova Senha | Gestão de Servidores PGM Natal',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./core/auth/pages/reset-password.page').then((m) => m.ResetPasswordPage)
  },

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
