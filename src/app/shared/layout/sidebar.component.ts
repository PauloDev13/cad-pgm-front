import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, MatListModule, MatIconModule, MatExpansionModule],
  standalone: true,
  template: `
    <div [class.sidebar-closed]="!isOpen()">
      <mat-nav-list class="pt-2" [class.menu-fechado]="!isOpen()">
        <a
          mat-list-item
          routerLink="/inicio"
          routerLinkActive="bg-blue-50 text-blue-700 border-r-4 border-blue-700"
        >
          <mat-icon matListItemIcon class="text-gray-600">home</mat-icon>
          @if (isOpen()) {
            <span matListItemTitle>Início</span>
          }
        </a>

        <mat-accordion displayMode="flat">
          <mat-expansion-panel class="mat-elevation-z0 bg-transparent">
            <mat-expansion-panel-header>
              <mat-panel-title class="flex items-center gap-4 font-medium">
                <mat-icon [class.pr-10]="!isOpen()" class="text-gray-600"
                  >manage_accounts
                </mat-icon>
                @if (isOpen()) {
                  <span>Gerenciamento</span>
                }
              </mat-panel-title>
            </mat-expansion-panel-header>
            <mat-nav-list class="pt-0">
              <a
                mat-list-item
                routerLink="/servidores"
                routerLinkActive="bg-blue-50 text-blue-700"
                [class.!pl-6]="isOpen()"
                [class.!pl-4]="!isOpen()"
              >
                <mat-icon matListItemIcon class="text-gray-500 scale-90">people</mat-icon>
                @if (isOpen()) {
                  <span matListItemTitle>Servidores</span>
                }
              </a>
            </mat-nav-list>
          </mat-expansion-panel>

          <mat-expansion-panel class="mat-elevation-z0 bg-transparent">
            <mat-expansion-panel-header>
              <mat-panel-title class="flex items-center gap-4 font-medium">
                <mat-icon [class.pr-10]="!isOpen()" class="text-gray-600">post_add</mat-icon>
                @if (isOpen()) {
                  <span>Cadastros</span>
                }
              </mat-panel-title>
            </mat-expansion-panel-header>
            <mat-nav-list class="pt-0">
              <a
                mat-list-item
                routerLink="/cadastro/cargo"
                routerLinkActive="bg-blue-50 text-blue-700"
                [class.!pl-6]="isOpen()"
                [class.!pl-2]="!isOpen()"
              >
                <mat-icon matListItemIcon class="text-gray-500 scale-90">work</mat-icon>
                @if (isOpen()) {
                  <span matListItemTitle>Cargo</span>
                }
              </a>
              <a
                mat-list-item
                routerLink="/cadastro/setor"
                routerLinkActive="bg-blue-50 text-blue-700"
                [class.!pl-6]="isOpen()"
                [class.!pl-2]="!isOpen()"
              >
                <mat-icon matListItemIcon class="text-gray-500 scale-90">domain</mat-icon>
                @if (isOpen()) {
                  <span matListItemTitle>Setor</span>
                }
              </a>
              <a
                mat-list-item
                routerLink="/cadastro/vinculo"
                routerLinkActive="bg-blue-50 text-blue-700"
                [class.!pl-6]="isOpen()"
                [class.!pl-2]="!isOpen()"
              >
                <mat-icon matListItemIcon class="text-gray-500 scale-90">link</mat-icon>
                @if (isOpen()) {
                  <span matListItemTitle>Vínculo</span>
                }
              </a>
              <a
                mat-list-item
                routerLink="/cadastro/status"
                routerLinkActive="bg-blue-50 text-blue-700"
                [class.!pl-6]="isOpen()"
                [class.!pl-2]="!isOpen()"
              >
                <mat-icon matListItemIcon class="text-gray-500 scale-90">fact_check</mat-icon>
                @if (isOpen()) {
                  <span matListItemTitle>Status</span>
                }
              </a>
            </mat-nav-list>
          </mat-expansion-panel>

          <mat-expansion-panel class="mat-elevation-z0 bg-transparent">
            <mat-expansion-panel-header>
              <mat-panel-title class="flex items-center gap-4 font-medium">
                <mat-icon [class.pr-10]="!isOpen()" class="text-gray-600"
                  >admin_panel_settings
                </mat-icon>
                @if (isOpen()) {
                  <span>Permissões</span>
                }
              </mat-panel-title>
            </mat-expansion-panel-header>
            <mat-nav-list class="pt-0">
              <a
                mat-list-item
                routerLink="/permissoes/procuradores"
                routerLinkActive="bg-blue-50 text-blue-700"
                [class.!pl-6]="isOpen()"
                [class.!pl-2]="!isOpen()"
              >
                <mat-icon matListItemIcon class="text-gray-500 scale-90">gavel</mat-icon>
                @if (isOpen()) {
                  <span matListItemTitle>Procuradores</span>
                }
              </a>
              <a
                mat-list-item
                routerLink="/permissoes/sistemas"
                routerLinkActive="bg-blue-50 text-blue-700"
                [class.!pl-6]="isOpen()"
                [class.!pl-2]="!isOpen()"
              >
                <mat-icon matListItemIcon class="text-gray-500 scale-90">dns</mat-icon>
                @if (isOpen()) {
                  <span matListItemTitle>Sistemas</span>
                }
              </a>
              <a
                mat-list-item
                routerLink="/permissoes/alias"
                routerLinkActive="bg-blue-50 text-blue-700"
                [class.!pl-6]="isOpen()"
                [class.!pl-2]="!isOpen()"
              >
                <mat-icon matListItemIcon class="text-gray-500 scale-90">label</mat-icon>
                @if (isOpen()) {
                  <span matListItemTitle>alias</span>
                }
              </a>
            </mat-nav-list>
          </mat-expansion-panel>
        </mat-accordion>
      </mat-nav-list>
    </div>
  `,
  styles: [
    `
      ::ng-deep .mat-expansion-panel-body {
        padding: 0 !important;
      }

      ::ng-deep .mat-expansion-panel-header {
        padding: 0 16px !important;
      }

      /* Garante que o ícone e a setinha não se separem bizarramente quando o texto sumir */
      ::ng-deep .mat-expansion-panel-header-title {
        margin-right: 0 !important;
      }

      /* Quando a sidebar encolhe (Mini Variant) */
      .sidebar-closed ::ng-deep .mat-expansion-indicator::after {
        display: none !important; /* Esconde a setinha */
      }

      .sidebar-closed ::ng-deep .mat-expansion-panel-header {
        padding: 0 !important;
        justify-content: center; /* Centraliza o ícone principal */
      }

      .sidebar-closed ::ng-deep .mat-expansion-panel-header-title {
        margin-right: 0;
        justify-content: center;
      }

      .sidebar-closed mat-icon {
        margin-right: 0 !important; /* Remove margem extra para centralizar perfeito */
      }

      /* Garante que os botões simples (ex: Início) fiquem colados à esquerda */
      ::ng-deep .mat-mdc-list-item-unscoped-content {
        justify-content: flex-start !important;
      }

      /* ✨ O DETALHE PIXEL PERFECT: Ajuste da setinha quando fechado ✨ */
      .menu-fechado ::ng-deep .mat-expansion-indicator {
        margin-right: 12px !important; /* Afasta a setinha da borda direita */
        margin-left: -12px !important; /* Puxa a setinha para mais perto do ícone */
        transform: scale(0.9); /* Opcional: deixa a setinha levemente mais delicada */
      }
    `,
  ],
})
export class SidebarComponent {
  // Recebe o estado de aberto/fechado do MainLayout
  isOpen = input.required<boolean>();
}
