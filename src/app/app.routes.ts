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
    ],
  },
  // PLACEHOLDERS FUTUROS:
  // Quando você for criar as outras telas, basta ir adicionando aqui:
  // { path: 'inicio', loadComponent: ... },
  // { path: 'cadastro/cargo', loadComponent: ... },

  {
    path: '**',
    redirectTo: 'home',
  },
];
