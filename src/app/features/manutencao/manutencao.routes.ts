import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/guards/auth.guard';

export const MANUTENCAO_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'meus-chamados',
    pathMatch: 'full'
  },
  {
    path: 'meus-chamados',
    title: 'Meus Chamados | Manutenção PGM Natal',
    loadComponent: () => import('./pages/chamados-meus.page')
  },
  {
    path: 'fila',
    title: 'Fila Geral de Manutenção | PGM Natal',
    canActivate: [roleGuard],
    data: { role: 'admin' }, // Ou perfil de almoxarifado/manutenção
    loadComponent: () => import('./pages/chamados-fila.page')
  },
  {
    path: 'dashboard',
    title: 'Indicadores de Manutenção | PGM Natal',
    loadComponent: () => import('./pages/manutencao-dashboard.page')
  },
  {
    path: 'catalogo',
    title: 'Catálogo de Serviços | Manutenção PGM Natal',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    loadComponent: () => import('./pages/manutencao-catalogo.page')
  }
];
