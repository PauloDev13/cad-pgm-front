import { ChangeDetectionStrategy, Component, inject, Injector, input, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LinkSidebarComponent } from './link-sidebar/link-sidebar.component';
import { ButtonSidebarComponent } from './button-sidebar/button-sidebar.component';
import { MatDialog } from '@angular/material/dialog';
import {
  MesAniversarioModalComponent
} from '../../../features/relatorios/components/aniversariantes/mes-aniversario-modal.component/mes-aniversario-modal.component';
import { AuthStore } from '../../../core/auth/store/auth.store';
import {
  FolhaPontoModalComponent
} from '../../../features/relatorios/components/folha-ponto/folha-ponto-modal.component/folha-ponto-modal.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    MatIconModule,
    MatTooltipModule,
    // NgClass,
    LinkSidebarComponent,
    ButtonSidebarComponent
  ],
  template: `
    <nav class="flex flex-col py-2 text-gray-700 select-none overflow-x-hidden">
      <a
        routerLink="/home"
        routerLinkActive="bg-blue-50 text-blue-600 border-r-4 border-blue-600"
        class="flex items-center h-12 w-full cursor-pointer hover:text-blue-700 hover:bg-blue-50 transition-colors group justify-center px-0"
        [class]="isOpen() ? 'md:px-4 md:justify-start' : 'md:px-0 md:justify-center'"
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
          label="Gerenciamento"
          [onOpen]="isOpen()"
          iconMenu="manage_accounts"
          [onOpenMenus]="openMenus()"
          toolTips="Gerenciamento"
          menuKey="gerenciamento"
          (toggleSubmenu)="toggleSubmenu('gerenciamento')"
        />

        <!-- Submenu Gerenciamento-->
        <div
          class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
          [class.max-h-0]="!openMenus()['gerenciamento']"
          [class.max-h-40]="openMenus()['gerenciamento']"
        >
          @if (canManager()) {
            <app-link-sidebar
              toolTip="Gestão de Usuário"
              link="/usuarios"
              [onOpen]="isOpen()"
              label="Usuários"
              icon="group_work"
            />
          }
          <app-link-sidebar
            toolTip="Gestão de Servidor"
            link="/servidores"
            [onOpen]="isOpen()"
            label="Servidores"
            icon="group"
          />
        </div>
      </div>

      @if (canManager()) {
        <div class="flex flex-col">
          <!-- Menu Cadastros-->
          <app-button-sidebar
            label="Cadastros"
            [onOpen]="isOpen()"
            [onOpenMenus]="openMenus()"
            iconMenu="post_add"
            toolTips="Cadastros"
            menuKey="cadastros"
            (toggleSubmenu)="toggleSubmenu('cadastros')"
          />
          <!-- Submenu Cadastros-->
          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
            [class.max-h-0]="!openMenus()['cadastros']"
            [class.max-h-96]="openMenus()['cadastros']"
          >
            <app-link-sidebar
              toolTip="Gestão de Cargo"
              link="/cadastros/cargos"
              [onOpen]="isOpen()"
              label="Cargo"
              icon="work"
            />
            <app-link-sidebar
              toolTip="Gestão de Setor"
              link="/cadastros/setores"
              [onOpen]="isOpen()"
              label="Setor"
              icon="domain"
            />
            <app-link-sidebar
              toolTip="Gestão de Vínculo"
              link="/cadastros/vinculos"
              [onOpen]="isOpen()"
              label="Vínculo"
              icon="link"
            />
            <app-link-sidebar
              toolTip="Gestão de Status"
              link="/cadastros/status"
              [onOpen]="isOpen()"
              label="Status"
              icon="fact_check"
            />
          </div>
        </div>
      }

      @if (canManager()) {
        <div class="flex flex-col">
          <!-- Menu Permissões-->
          <app-button-sidebar
            label="Permissões"
            [onOpen]="isOpen()"
            (toggleSubmenu)="toggleSubmenu('permissoes')"
            iconMenu="admin_panel_settings"
            toolTips="Permissões"
            menuKey="permissoes"
            [onOpenMenus]="openMenus()"
          />
          <!-- submenu Permissões-->
          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
            [class.max-h-0]="!openMenus()['permissoes']"
            [class.max-h-96]="openMenus()['permissoes']"
          >
            <app-link-sidebar
              toolTip="Gestão de Procuradores"
              link="/permissoes/procuradores"
              [onOpen]="isOpen()"
              label="Procuradores"
              icon="gavel"
            />

            <app-link-sidebar
              toolTip="Gestão de Sistemas"
              link="/permissoes/sistemas"
              [onOpen]="isOpen()"
              label="Sistemas"
              icon="dns"
            />

            <app-link-sidebar
              toolTip="Gestão de Alias"
              link="/permissoes/alias"
              [onOpen]="isOpen()"
              label="Alias (E-mail)"
              icon="mail"
            />
          </div>
        </div>
      }
      <div class="flex flex-col">
        <!-- Menu Relatórios-->
        <app-button-sidebar
          label="Relatórios"
          [onOpen]="isOpen()"
          [onOpenMenus]="openMenus()"
          iconMenu="content_paste_search"
          toolTips="Relatórios"
          menuKey="relatorios"
          (toggleSubmenu)="toggleSubmenu('relatorios')"
        />
        <!-- Submenu Relatórios-->
        <div
          class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
          [class.max-h-0]="!openMenus()['relatorios']"
          [class.max-h-96]="openMenus()['relatorios']"
        >
          @if (canManager()) {
            <app-link-sidebar
              toolTip="Rel. Auditoria"
              link="/relatorios/auditoria"
              [onOpen]="isOpen()"
              label="Auditoria"
              icon="change_history"
            />
          }
          <app-link-sidebar
            toolTip="Rel. Aniversariantes"
            label="Aniversariantes"
            icon="cake"
            [onOpen]="isOpen()"
            (actionClick)="openBirthdayReport()"
          />

          <app-link-sidebar
            toolTip="Rel. Folha de Ponto"
            label="Folha de Ponto"
            icon="assignment"
            [onOpen]="isOpen()"
            (actionClick)="openFolhaPontoReport()"
          />

          <app-link-sidebar
            toolTip="Controle de Ponto Eletrônico"
            link="/controle-ponto"
            [onOpen]="isOpen()"
            label="Controle de Ponto"
            icon="timer"
          />
        </div>
      </div>
    </nav>
  `,
})
export class SidebarComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // Recebe o estado do layout pai
  isOpen = input.required<boolean>();

  // Signal que mapeia qual submenu está aberto
  openMenus = signal<Record<string, boolean>>({
    gerenciamento: false,
    cadastros: false,
    permissoes: false,
    relatorios: false
  });

  // Retorna verdadeiro se o usuário logado é admin
  canManager = this.authStore.canManager;

  // Função que inverte o estado do submenu clicado
  toggleSubmenu(menu: string) {
    this.openMenus.update((menus) => ({
      ...menus,
      [menu]: !menus[menu]
    }));
  }

  openBirthdayReport() {
    const dialogRef = this.dialog.open(MesAniversarioModalComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((month) => {
      if (month) {
        this.router.navigate(['/relatorios/aniversariantes'], {
          queryParams: { month: month }
        }).then();
      }
    });
  }

  openFolhaPontoReport() {
    const dialogRef = this.dialog.open(FolhaPontoModalComponent,
      {
        width: '450px',
        disableClose: true,
        injector: this.injector
      }
    );

    dialogRef.afterClosed().subscribe((filtros) => {
      if (filtros) {
        // Redireciona e injeta Mês, Ano e Setor na URL do navegador
        this.router.navigate(['/relatorios/folha-ponto'], {
          queryParams: {
            mes: filtros.mes,
            ano: filtros.ano,
            setorId: filtros.setorId
          }
        });
      }
    });
  }
}
