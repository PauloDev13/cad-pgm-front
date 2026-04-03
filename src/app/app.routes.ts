import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout.component';

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
        loadComponent: () => import('./features/home/home.component'),
      },
      {
        // A sua tela já existente, intacta!
        path: 'servidores',
        title: 'Gestão de Servidores',
        loadComponent: () => import('./features/servidores/list/servidor-list.component'),
      },
      {
        // tela para cadastro, edição e exclusão de cargos
        path: 'cadastro/cargos',
        title: 'Gestão de Cargos',
        loadComponent: () => import('./features/cadastros/cargo-display.component'),
      },
      {
        // tela para cadastro, edição e exclusão de setores
        path: 'cadastro/setores',
        title: 'Gestão de Setores',
        loadComponent: () => import('./features/cadastros/setor-display.component'),
      },
      {
        // tela para cadastro, edição e exclusão de vínculos
        path: 'cadastro/vinculos',
        title: 'Gestão de Vínculos',
        loadComponent: () => import('./features/cadastros/vinculo-display.component'),
      },
      {
        // tela para cadastro, edição e exclusão status
        path: 'cadastro/status',
        title: 'Gestão de Status',
        loadComponent: () => import('./features/cadastros/status-display.component'),
      },
      {
        // tela para cadastro, edição e exclusão de procuradores
        path: 'permissoes/procuradores',
        title: 'Gestão de Procuradores',
        loadComponent: () => import('./features/cadastros/procurador-display.component'),
      },
      {
        // tela para cadastro, edição e exclusão de sistemas
        path: 'permissoes/sistemas',
        title: 'Gestão de Sistemas',
        loadComponent: () => import('./features/cadastros/sistema-display.component'),
      },
      {
        // tela para cadastro, edição e exclusão de alias
        path: 'permissoes/alias',
        title: 'Gestão de Alias',
        loadComponent: () => import('./features/cadastros/alias-display.component'),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];
