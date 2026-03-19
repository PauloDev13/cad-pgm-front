import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'servidores',
    pathMatch: 'full',
  },
  {
    path: 'servidores',
    title: 'Gestão de Servidores',
    loadComponent: () => import('./features/servidores/list/servidor-list.component')
  },
  {
    path: '**',
    redirectTo: 'servidores',
  }
];
