import { Component, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  template: `
    <nav class="flex flex-col py-2 text-gray-700 select-none">
      <a
        routerLink="/inicio"
        routerLinkActive="bg-blue-50 text-blue-600 border-r-4 border-blue-600"
        class="flex items-center h-12 cursor-pointer hover:text-blue-700
               hover:bg-blue-50 transition-colors group"
        [class.px-4]="isOpen()"
        [class.justify-start]="isOpen()"
        [class.px-0]="!isOpen()"
        [class.justify-center]="!isOpen()"
      >
        <mat-icon class="text-gray-600 group-hover:text-blue-600 transition-colors">home</mat-icon>
        @if (isOpen()) {
          <span class="ml-4 font-medium">Início</span>
        }
      </a>

      <div class="flex flex-col">
        <button
          (click)="toggleSubmenu('gerenciamento')"
          class="flex items-center h-12 w-full cursor-pointer transition-colors group relative"
          [class.px-4]="isOpen()"
          [class.justify-between]="isOpen()"
          [class.px-0]="!isOpen()"
          [class.justify-center]="!isOpen()"
        >
          <div
            class="flex items-center group-hover:text-blue-700"
            [class.w-full]="!isOpen()"
            [class.justify-center]="!isOpen()"
          >
            <mat-icon class="text-gray-700 group-hover:text-blue-700 transition-colors"
              >manage_accounts
            </mat-icon>
            @if (isOpen()) {
              <span class="ml-4 font-medium group-hover:font-semibold">Gerenciamento</span>
            }
          </div>

          <mat-icon
            class="text-gray-400 transition-transform duration-300 group-hover:!text-blue-700"
            [class.rotate-180]="openMenus()['gerenciamento']"
            [class.absolute]="!isOpen()"
            [class.right-2]="!isOpen()"
            [class.scale-75]="!isOpen()"
          >
            expand_more
          </mat-icon>
        </button>

        <div
          class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
          [class.max-h-0]="!openMenus()['gerenciamento']"
          [class.max-h-40]="openMenus()['gerenciamento']"
        >
          <a
            routerLink="/servidores"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="flex items-center h-10 hover:bg-blue-50 transition-colors group
                  hover:text-blue-700 hover:font-semibold"
            [class.pl-12]="isOpen()"
            [class.pl-10]="!isOpen()"
          >
            <mat-icon class="scale-90 text-gray-500 group-hover:text-blue-700 hover:text-blue-700">
              people
            </mat-icon>
            @if (isOpen()) {
              <span class="ml-4">Servidores</span>
            }
          </a>
        </div>
      </div>

      <div class="flex flex-col">
        <button
          (click)="toggleSubmenu('cadastros')"
          class="flex items-center h-12 w-full cursor-pointer transition-colors group relative"
          [class.px-4]="isOpen()"
          [class.justify-between]="isOpen()"
          [class.px-0]="!isOpen()"
          [class.justify-center]="!isOpen()"
        >
          <div
            class="flex items-center group-hover:text-blue-700"
            [class.w-full]="!isOpen()"
            [class.justify-center]="!isOpen()"
          >
            <mat-icon class="text-gray-600 group-hover:text-blue-700 transition-colors"
              >post_add
            </mat-icon>
            @if (isOpen()) {
              <span class="ml-4 font-medium group-hover:font-semibold">Cadastros</span>
            }
          </div>
          <mat-icon
            class="text-gray-400 transition-transform duration-300 group-hover:!text-blue-700"
            [class.rotate-180]="openMenus()['cadastros']"
            [class.absolute]="!isOpen()"
            [class.right-2]="!isOpen()"
            [class.scale-75]="!isOpen()"
          >
            expand_more
          </mat-icon>
        </button>

        <div
          class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
          [class.max-h-0]="!openMenus()['cadastros']"
          [class.max-h-96]="openMenus()['cadastros']"
        >
          <a
            routerLink="/cadastro/cargo"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="flex items-center h-10 hover:bg-blue-50 transition-colors group"
            [class.pl-12]="isOpen()"
            [class.pl-10]="!isOpen()"
          >
            <mat-icon class="scale-90 text-gray-500 group-hover:!text-blue-700">work</mat-icon>
            @if (isOpen()) {
              <span class="ml-4 group-hover:text-blue-700 group-hover:font-semibold">Cargo</span>
            }
          </a>
          <a
            routerLink="/cadastro/setor"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="flex items-center h-10 hover:bg-blue-50 transition-colors group"
            [class.pl-12]="isOpen()"
            [class.pl-10]="!isOpen()"
          >
            <mat-icon class="scale-90 text-gray-500 group-hover:!text-blue-700">domain</mat-icon>
            @if (isOpen()) {
              <span class="ml-4 group-hover:text-blue-700 group-hover:font-semibold">Setor</span>
            }
          </a>
          <a
            routerLink="/cadastro/vinculo"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="flex items-center h-10 hover:bg-blue-50 transition-colors group"
            [class.pl-12]="isOpen()"
            [class.pl-10]="!isOpen()"
          >
            <mat-icon class="scale-90 text-gray-500 group-hover:!text-blue-700">link</mat-icon>
            @if (isOpen()) {
              <span class="ml-4 group-hover:text-blue-700 group-hover:font-semibold">Vínculo</span>
            }
          </a>
          <a
            routerLink="/cadastro/status"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="flex items-center h-10 hover:bg-blue-50 transition-colors group"
            [class.pl-12]="isOpen()"
            [class.pl-10]="!isOpen()"
          >
            <mat-icon class="scale-90 text-gray-500 group-hover:!text-blue-700">
              fact_check
            </mat-icon>
            @if (isOpen()) {
              <span class="ml-4 group-hover:text-blue-700 group-hover:font-semibold">Status</span>
            }
          </a>
        </div>
      </div>

      <div class="flex flex-col">
        <button
          (click)="toggleSubmenu('permissoes')"
          class="flex items-center h-12 w-full cursor-pointer transition-colors group relative"
          [class.px-4]="isOpen()"
          [class.justify-between]="isOpen()"
          [class.px-0]="!isOpen()"
          [class.justify-center]="!isOpen()"
        >
          <div
            class="flex items-center group-hover:text-blue-700"
            [class.w-full]="!isOpen()"
            [class.justify-center]="!isOpen()"
          >
            <mat-icon class="text-gray-600 transition-colors">admin_panel_settings</mat-icon>
            @if (isOpen()) {
              <span class="ml-4 font-medium group-hover:font-semibold">Permissões</span>
            }
          </div>

          <mat-icon
            class="text-gray-400 transition-transform duration-300 group-hover:!text-blue-700"
            [class.rotate-180]="openMenus()['permissoes']"
            [class.absolute]="!isOpen()"
            [class.right-2]="!isOpen()"
            [class.scale-75]="!isOpen()"
          >
            expand_more
          </mat-icon>
        </button>

        <div
          class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
          [class.max-h-0]="!openMenus()['permissoes']"
          [class.max-h-96]="openMenus()['permissoes']"
        >
          <a
            routerLink="/permissoes/procuradores"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="flex items-center h-10 hover:bg-blue-50 transition-colors group"
            [class.pl-12]="isOpen()"
            [class.pl-10]="!isOpen()"
          >
            <mat-icon class="scale-90 text-gray-500 group-hover:!text-blue-700"> gavel</mat-icon>
            @if (isOpen()) {
              <span class="ml-4 group-hover:text-blue-700 group-hover:font-semibold"
                >Procuradores</span
              >
            }
          </a>
          <a
            routerLink="/permissoes/sistemas"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="flex items-center h-10 hover:bg-blue-50 transition-colors group"
            [class.pl-12]="isOpen()"
            [class.pl-10]="!isOpen()"
          >
            <mat-icon class="scale-90 text-gray-500 group-hover:!text-blue-700"> dns</mat-icon>
            @if (isOpen()) {
              <span class="ml-4 group-hover:text-blue-700 group-hover:font-semibold">Sistemas</span>
            }
          </a>
          <a
            routerLink="/permissoes/alias"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="flex items-center h-10 hover:bg-blue-50 transition-colors group"
            [class.pl-12]="isOpen()"
            [class.pl-10]="!isOpen()"
          >
            <mat-icon class="scale-90 text-gray-500 group-hover:!text-blue-700"> label</mat-icon>
            @if (isOpen()) {
              <span class="ml-4 group-hover:text-blue-700 group-hover:font-semibold"
                >Alias (E-mails)</span
              >
            }
          </a>
        </div>
      </div>
    </nav>
  `,
})
export class SidebarComponent {
  // Recebe o estado do layout pai
  isOpen = input.required<boolean>();

  // ✨ Signal que mapeia qual submenu está aberto
  openMenus = signal<Record<string, boolean>>({
    gerenciamento: false,
    cadastros: false,
    permissoes: false,
  });

  // Função que inverte o estado do submenu clicado
  toggleSubmenu(menu: string) {
    this.openMenus.update((menus) => ({
      ...menus,
      [menu]: !menus[menu],
    }));
  }
}
