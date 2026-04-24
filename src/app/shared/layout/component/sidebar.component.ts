import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/services/auth.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatTooltipModule, NgClass],
  template: `
    <nav class="flex flex-col py-2 text-gray-700 select-none overflow-x-hidden">

      <a
        routerLink="/inicio"
        routerLinkActive="bg-blue-50 text-blue-600 border-r-4 border-blue-600"
        class="flex items-center h-12 w-full cursor-pointer hover:text-blue-700 hover:bg-blue-50 transition-colors group justify-center px-0"
        [ngClass]="isOpen() ? 'md:px-4 md:justify-start' : 'md:px-0 md:justify-center'"
        matTooltip="Página inicial"
        matTooltipPosition="right"
        [matTooltipDisabled]="isOpen()"
        matTooltipClass="tooltip-blue"
      >
        <mat-icon class="text-gray-700 group-hover:scale-125 transition-all duration-200">home</mat-icon>
        @if (isOpen()) {
          <span class="ml-4 font-medium hidden md:block whitespace-nowrap">Início</span>
        }
      </a>

      <div class="flex flex-col">
        <button
          (click)="toggleSubmenu('gerenciamento')"
          class="flex items-center h-12 w-full cursor-pointer transition-colors group relative justify-center px-0"
          [ngClass]="isOpen() ? 'md:px-4 md:justify-between' : 'md:px-0 md:justify-center'"
          matTooltip="Gerenciamento"
          matTooltipPosition="right"
          [matTooltipDisabled]="isOpen()"
          matTooltipClass="tooltip-blue"
        >
          <div class="flex items-center group-hover:text-blue-700">
            <mat-icon class="text-gray-700 group-hover:scale-125 transition-all duration-200">manage_accounts</mat-icon>
            @if (isOpen()) {
              <span
                class="ml-4 font-medium group-hover:font-semibold hidden md:block whitespace-nowrap">Gerenciamento</span>
            }
          </div>

          <mat-icon
            class="text-gray-400 transition-transform duration-300 group-hover:!text-blue-700 shrink-0"
            [class.rotate-180]="openMenus()['gerenciamento']"
            [ngClass]="isOpen() ? '-ml-1 md:ml-0 scale-75 md:scale-100' : '-ml-1 scale-75'"
          >
            expand_more
          </mat-icon>
        </button>

        <div
          class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
          [class.max-h-0]="!openMenus()['gerenciamento']"
          [class.max-h-40]="openMenus()['gerenciamento']"
        >
          @if (isLinkMenuHidden()) {
            <a
              routerLink="/usuarios"
              routerLinkActive="bg-blue-50 text-blue-600"
              class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
              [ngClass]="isOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
              matTooltip="Cadastro de Usuários"
              matTooltipPosition="right"
              [matTooltipDisabled]="isOpen()"
              matTooltipClass="tooltip-blue"
            >
              <mat-icon>people</mat-icon>
              @if (isOpen()) {
                <span class="ml-4 hidden md:inline whitespace-nowrap">Usuários</span>
              }
            </a>
          }
          <a
            routerLink="/servidores"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
            [ngClass]="isOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
            matTooltip="Cadastro de Servidores"
            matTooltipPosition="right"
            [matTooltipDisabled]="isOpen()"
            matTooltipClass="tooltip-blue"
          >
            <mat-icon>people</mat-icon>
            @if (isOpen()) {
              <span class="ml-4 hidden md:inline whitespace-nowrap">Servidores</span>
            }
          </a>
        </div>
      </div>

      @if (isLinkMenuHidden()) {
        <div class="flex flex-col">
          <button
            (click)="toggleSubmenu('cadastros')"
            class="flex items-center h-12 w-full cursor-pointer transition-colors group relative justify-center px-0"
            [ngClass]="isOpen() ? 'md:px-4 md:justify-between' : 'md:px-0 md:justify-center'"
            matTooltip="Cadastros"
            matTooltipPosition="right"
            [matTooltipDisabled]="isOpen()"
            matTooltipClass="tooltip-blue"
          >
            <div class="flex items-center group-hover:text-blue-700">
              <mat-icon class="text-gray-700 group-hover:scale-125 transition-all duration-200">post_add</mat-icon>
              @if (isOpen()) {
                <span
                  class="ml-4 font-medium group-hover:font-semibold hidden md:block whitespace-nowrap">Cadastros</span>
              }
            </div>

            <mat-icon
              class="text-gray-400 transition-transform duration-300 group-hover:!text-blue-700 shrink-0"
              [class.rotate-180]="openMenus()['cadastros']"
              [ngClass]="isOpen() ? '-ml-1 md:ml-0 scale-75 md:scale-100' : '-ml-1 scale-75'"
            >
              expand_more
            </mat-icon>
          </button>

          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
            [class.max-h-0]="!openMenus()['cadastros']"
            [class.max-h-96]="openMenus()['cadastros']"
          >
            <a routerLink="/cadastro/cargos" routerLinkActive="bg-blue-50 text-blue-600"
               class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
               [ngClass]="isOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
               matTooltip="Cadastrar Cargo" matTooltipPosition="right" [matTooltipDisabled]="isOpen()"
               matTooltipClass="tooltip-blue">
              <mat-icon>work</mat-icon>
              @if (isOpen()) {
                <span class="ml-4 hidden md:inline whitespace-nowrap">Cargo</span>
              }
            </a>
            <a routerLink="/cadastro/setores" routerLinkActive="bg-blue-50 text-blue-600"
               class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
               [ngClass]="isOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
               matTooltip="Cadastrar Setor" matTooltipPosition="right" [matTooltipDisabled]="isOpen()"
               matTooltipClass="tooltip-blue">
              <mat-icon>domain</mat-icon>
              @if (isOpen()) {
                <span class="ml-4 hidden md:inline whitespace-nowrap">Setor</span>
              }
            </a>
            <a routerLink="/cadastro/vinculos" routerLinkActive="bg-blue-50 text-blue-600"
               class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
               [ngClass]="isOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
               matTooltip="Cadastrar Vínculo" matTooltipPosition="right" [matTooltipDisabled]="isOpen()"
               matTooltipClass="tooltip-blue">
              <mat-icon>link</mat-icon>
              @if (isOpen()) {
                <span class="ml-4 hidden md:inline whitespace-nowrap">Vínculo</span>
              }
            </a>
            <a routerLink="/cadastro/status" routerLinkActive="bg-blue-50 text-blue-600"
               class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
               [ngClass]="isOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
               matTooltip="Cadastrar Status" matTooltipPosition="right" [matTooltipDisabled]="isOpen()"
               matTooltipClass="tooltip-blue">
              <mat-icon>fact_check</mat-icon>
              @if (isOpen()) {
                <span class="ml-4 hidden md:inline whitespace-nowrap">Status</span>
              }
            </a>
          </div>
        </div>
      }

      @if (isLinkMenuHidden()) {
        <div class="flex flex-col">
          <button
            (click)="toggleSubmenu('permissoes')"
            class="flex items-center h-12 w-full cursor-pointer transition-colors group relative justify-center px-0"
            [ngClass]="isOpen() ? 'md:px-4 md:justify-between' : 'md:px-0 md:justify-center'"
            matTooltip="Vínculos e Permissões"
            matTooltipPosition="right"
            [matTooltipDisabled]="isOpen()"
            matTooltipClass="tooltip-blue"
          >
            <div class="flex items-center group-hover:text-blue-700">
              <mat-icon class="text-gray-700 group-hover:scale-125 transition-all duration-200">admin_panel_settings
              </mat-icon>
              @if (isOpen()) {
                <span
                  class="ml-4 font-medium group-hover:font-semibold hidden md:block whitespace-nowrap">Permissões</span>
              }
            </div>

            <mat-icon
              class="text-gray-400 transition-transform duration-300 group-hover:!text-blue-700 shrink-0"
              [class.rotate-180]="openMenus()['permissoes']"
              [ngClass]="isOpen() ? '-ml-1 md:ml-0 scale-75 md:scale-100' : '-ml-1 scale-75'"
            >
              expand_more
            </mat-icon>
          </button>

          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
            [class.max-h-0]="!openMenus()['permissoes']"
            [class.max-h-96]="openMenus()['permissoes']"
          >
            <a routerLink="/permissoes/procuradores" routerLinkActive="bg-blue-50 text-blue-600"
               class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
               [ngClass]="isOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
               matTooltip="Cadastrar Procurador" matTooltipPosition="right" [matTooltipDisabled]="isOpen()"
               matTooltipClass="tooltip-blue">
              <mat-icon>gavel</mat-icon>
              @if (isOpen()) {
                <span class="ml-4 hidden md:inline whitespace-nowrap">Procuradores</span>
              }
            </a>
            <a routerLink="/permissoes/sistemas" routerLinkActive="bg-blue-50 text-blue-600"
               class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
               [ngClass]="isOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
               matTooltip="Cadastrar Sistema" matTooltipPosition="right" [matTooltipDisabled]="isOpen()"
               matTooltipClass="tooltip-blue">
              <mat-icon>dns</mat-icon>
              @if (isOpen()) {
                <span class="ml-4 hidden md:inline whitespace-nowrap">Sistemas</span>
              }
            </a>
            <a routerLink="/permissoes/alias" routerLinkActive="bg-blue-50 text-blue-600"
               class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
               [ngClass]="isOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
               matTooltip="Cadastrar Alias(Email)" matTooltipPosition="right" [matTooltipDisabled]="isOpen()"
               matTooltipClass="tooltip-blue">
              <mat-icon>label</mat-icon>
              @if (isOpen()) {
                <span class="ml-4 hidden md:inline whitespace-nowrap">Alias (E-mails)</span>
              }
            </a>
          </div>
        </div>
      }
    </nav>
  `
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  // Recebe o estado do layout pai
  isOpen = input.required<boolean>();

  // Signal que mapeia qual submenu está aberto
  openMenus = signal<Record<string, boolean>>({
    gerenciamento: false,
    cadastros: false,
    permissoes: false
  });

  // Verifica se o usuário logado é admin
  isLinkMenuHidden = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return;
    return user.roles.find((p) => p === 'admin');
  });

  // Função que inverte o estado do submenu clicado
  toggleSubmenu(menu: string) {
    this.openMenus.update((menus) => ({
      ...menus,
      [menu]: !menus[menu]
    }));
  }
}
