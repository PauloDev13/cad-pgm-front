import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/component/main-layout.component';

export const routes: Routes = [
  {
    // A Rota Principal agora carrega o Menu Lateral
    path: '',
    component: MainLayoutComponent,
    // Tudo que estiver aqui dentro vai aparecer no <router-outlet> do Menu
    children: [
      {
        // Se acessar localhost:4200 vazio, joga a página inicial
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        title: 'Início | Gestão de Servidores PGM Natal',
        loadComponent: () => import('./features/home/pages/home.page'),
      },
      {
        // A sua tela já existente, intacta!
        path: 'servidores',
        title: 'Gestão de Servidores',
        loadComponent: () => import('./features/servidor/pages/servidor-list.page'),
      },
      {
        // tela para cadastro, edição e exclusão de cargos
        path: 'cadastro/cargos',
        title: 'Gestão de Cargos',
        loadComponent: () => import('./features/cargo/pages/cargo-display.page'),
      },
      {
        // tela para cadastro, edição e exclusão de setores
        path: 'cadastro/setores',
        title: 'Gestão de Setores',
        loadComponent: () => import('./features/setor/pages/setor-display.page'),
      },
      {
        // tela para cadastro, edição e exclusão de vínculos
        path: 'cadastro/vinculos',
        title: 'Gestão de Vínculos',
        loadComponent: () => import('./features/vinculo/pages/vinculo-display.page'),
      },
      {
        // tela para cadastro, edição e exclusão status
        path: 'cadastro/status',
        title: 'Gestão de Status',
        loadComponent: () => import('./features/status/pages/status-display.page'),
      },
      {
        // tela para cadastro, edição e exclusão de procuradores
        path: 'permissoes/procuradores',
        title: 'Gestão de Procuradores',
        loadComponent: () => import('./features/procurador/pages/procurador-display.page'),
      },
      {
        // tela para cadastro, edição e exclusão de sistemas
        path: 'permissoes/sistemas',
        title: 'Gestão de Sistemas',
        loadComponent: () => import('./features/sistema/pages/sistema-display.page'),
      },
      {
        // tela para cadastro, edição e exclusão de alias
        path: 'permissoes/alias',
        title: 'Gestão de Alias',
        loadComponent: () => import('./features/alias/pages/alias-display.page'),
      },
      {
        // tela para visualização de detalhes do servidor
        path: 'servidores/detalhes/:id',
        title: 'Detalhes do servidor',
        loadComponent: () => import('./features/servidor/pages/servidor-detalhes.page'),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];
