import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/services/auth.service';
import { NgClass } from '@angular/common';
import { LinkSidebarComponent } from './link-sidebar/link-sidebar.component';
import { ButtonSidebarComponent } from './button-sidebar/button-sidebar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    MatIconModule,
    MatTooltipModule,
    NgClass,
    LinkSidebarComponent,
    ButtonSidebarComponent
  ],
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
        <!-- Menu Gerenciamento-->
        <app-button-sidebar
          [label]="'Gerenciamento'"
          [onOpen]="isOpen()"
          [iconMenu]="'manage_accounts'"
          [onOpenMenus]="openMenus()"
          [toolTips]="'Gerenciamento'"
          (toggleSubmenu)="toggleSubmenu('gerenciamento')"
        />

        <!-- Submenu Gerenciamento-->
        <div
          class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
          [class.max-h-0]="!openMenus()['gerenciamento']"
          [class.max-h-40]="openMenus()['gerenciamento']"
        >
          @if (isLinkMenuHidden()) {
            <app-link-sidebar
              [toolTip]="'Gestão de Usuário'"
              [link]="'/usuarios'"
              [onOpen]="isOpen()"
              [label]="'Usuários'"
              [icon]="'group_work'"
            />
          }
          <app-link-sidebar
            [toolTip]="'Gestão de Servidor'"
            [link]="'/servidores'"
            [onOpen]="isOpen()"
            [label]="'Servidores'"
            [icon]="'group'"
          />
        </div>
      </div>

      @if (isLinkMenuHidden()) {
        <div class="flex flex-col">
          <!-- Menu Cadastros-->
          <app-button-sidebar
            [label]="'Cadastros'"
            [onOpen]="isOpen()"
            [onOpenMenus]="openMenus()"
            [iconMenu]="'post_add'"
            [toolTips]="'Cadastros'"
            (toggleSubmenu)="toggleSubmenu('cadastros')"
          />
          <!-- Submenu Cadastros-->
          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
            [class.max-h-0]="!openMenus()['cadastros']"
            [class.max-h-96]="openMenus()['cadastros']"
          >
            <app-link-sidebar
              [toolTip]="'Gestão de Cargo'"
              [link]="'/cadastros/cargos'"
              [onOpen]="isOpen()"
              [label]="'Cargo'"
              [icon]="'work'"
            />
            <app-link-sidebar
              [toolTip]="'Gestão de Setor'"
              [link]="'/cadastros/setores'"
              [onOpen]="isOpen()"
              [label]="'Setor'"
              [icon]="'domain'"
            />
            <app-link-sidebar
              [toolTip]="'Gestão de Vínculo'"
              [link]="'/cadastros/vinculos'"
              [onOpen]="isOpen()"
              [label]="'Vínculo'"
              [icon]="'link'"
            />
            <app-link-sidebar
              [toolTip]="'Gestão de Status'"
              [link]="'/cadastros/status'"
              [onOpen]="isOpen()"
              [label]="'Status'"
              [icon]="'fact_check'"
            />
          </div>
        </div>
      }

      @if (isLinkMenuHidden()) {
        <div class="flex flex-col">
          <!-- Menu Permissões-->
          <app-button-sidebar
            [label]="'Permissões'"
            [onOpen]="isOpen()"
            (toggleSubmenu)="toggleSubmenu('permissoes')"
            [iconMenu]="'admin_panel_settings'"
            [toolTips]="'Permissões'"
            [onOpenMenus]="openMenus()"
          />
          <!-- submenu Permissões-->
          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
            [class.max-h-0]="!openMenus()['permissoes']"
            [class.max-h-96]="openMenus()['permissoes']"
          >
            <app-link-sidebar
              [toolTip]="'Gestão de Procuradores'"
              [link]="'/permissoes/procuradores'"
              [onOpen]="isOpen()"
              [label]="'Procuradores'"
              [icon]="'gavel'"
            />

            <app-link-sidebar
              [toolTip]="'Gestão de Sistemas'"
              [link]="'/permissoes/sistemas'"
              [onOpen]="isOpen()"
              [label]="'Sistemas'"
              [icon]="'dns'"
            />

            <app-link-sidebar
              [toolTip]="'Gestão de Alias'"
              [link]="'/permissoes/alias'"
              [onOpen]="isOpen()"
              [label]="'Alias (E-mail)'"
              [icon]="'mail'"
            />
          </div>
        </div>
      }

      @if (isLinkMenuHidden()) {
        <div class="flex flex-col">
          <!-- Menu Relatórios-->
          <app-button-sidebar
            [label]="'Relatórios'"
            [onOpen]="isOpen()"
            [onOpenMenus]="openMenus()"
            [iconMenu]="'content_paste_search'"
            [toolTips]="'Relatórios'"
            (toggleSubmenu)="toggleSubmenu('relatorios')"
          />
          <!-- Submenu Relatórios-->
          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
            [class.max-h-0]="!openMenus()['relatorios']"
            [class.max-h-96]="openMenus()['relatorios']"
          >
            <app-link-sidebar
              [toolTip]="'Rel. Auditoria'"
              [link]="'/relatorios/auditoria'"
              [onOpen]="isOpen()"
              [label]="'Auditoria'"
              [icon]="'change_history'"
            />
            <app-link-sidebar
              [toolTip]="'Rel. Aniversariantes'"
              [link]="'/relatorios/aniversariantes'"
              [onOpen]="isOpen()"
              [label]="'Aniversariantes'"
              [icon]="'celebration'"
            />
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
