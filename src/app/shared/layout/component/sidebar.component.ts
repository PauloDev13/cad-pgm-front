import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, signal } from '@angular/core';
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
import {
  CertificadosVinculadosModalComponent
} from '../../../features/relatorios/components/certificados-vinculados/certificados-vinculados-modal.component/certificados-vinculados-modal.component';
import {
  SistemasVinculadosModalComponent
} from '../../../features/relatorios/components/sistemas-vinculados/sistemas-vinculados-modal/sistemas-vinculados-modal.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    MatIconModule,
    MatTooltipModule,
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
        <!-- MENU GERENCIAMENTO-->
        @if (authStore.canEdit()) {
          <app-button-sidebar
            label="Gerenciamento"
            [onOpen]="isOpen()"
            iconMenu="manage_accounts"
            [onOpenMenus]="openMenus()"
            toolTips="Gerenciamento"
            menuKey="gerenciamento"
            (toggleSubmenu)="toggleSubmenu('gerenciamento')"
          />
        }

        <!-- SUBMENUS GERENCIAMENTO-->
        <div
          class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
          [class.max-h-0]="!openMenus()['gerenciamento']"
          [class.max-h-40]="openMenus()['gerenciamento']"
        >
          @if (authStore.canManager()) {
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

      @if (authStore.canManager()) {
        <!-- MENU CADASTRO-->
        <div class="flex flex-col">
          <app-button-sidebar
            label="Cadastros"
            [onOpen]="isOpen()"
            [onOpenMenus]="openMenus()"
            iconMenu="post_add"
            toolTips="Cadastros"
            menuKey="cadastros"
            (toggleSubmenu)="toggleSubmenu('cadastros')"
          />
          <!-- SUBMENUS CADASTRO-->
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

        <!-- MENU PERMISSÕES-->
        <div class="flex flex-col">
          <app-button-sidebar
            label="Vinculos"
            [onOpen]="isOpen()"
            (toggleSubmenu)="toggleSubmenu('permissoes')"
            iconMenu="admin_panel_settings"
            toolTips="Permissões"
            menuKey="permissoes"
            [onOpenMenus]="openMenus()"
          />
          <!-- SUBMENUS PERMISSÕES-->
          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
            [class.max-h-0]="!openMenus()['permissoes']"
            [class.max-h-96]="openMenus()['permissoes']"
          >
            <app-link-sidebar
              toolTip="Gestão de Procuradores"
              link="/permissoes/procuradores"
              [onOpen]="isOpen()"
              label="Cert. Digitais"
              icon="badge"
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

      <!-- MENU MANUTENÇÃO -->
      @if (canAcessarMenuManutencao()) {
        <div class="flex flex-col">
          <app-button-sidebar
            label="Manutenção"
            [onOpen]="isOpen()"
            iconMenu="build"
            [onOpenMenus]="openMenus()"
            toolTips="Manutenção Predial"
            menuKey="manutencao"
            (toggleSubmenu)="toggleSubmenu('manutencao')"
          />
          <!-- SUBMENUS MANUTENÇÃO-->
          <div
            class="overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
            [class.max-h-0]="!openMenus()['manutencao']"
            [class.max-h-60]="openMenus()['manutencao']"
          >
            <!-- 1. MEUS CHAMADOS (Admin ou Solicitante) -->
            @if (canAcessarMeusChamados()) {
              <app-link-sidebar
                toolTip="Meus Chamados"
                link="/manutencao/meus-chamados"
                [onOpen]="isOpen()"
                label="Meus Chamados"
                icon="assignment"
              />
            }

            <!-- 2. FILA GERAL (Almoxarifado + Tramitador) -->
            @if (canAcessarFilaGeral()) {
              <app-link-sidebar
                toolTip="Fila Geral"
                link="/manutencao/fila"
                [onOpen]="isOpen()"
                label="Fila Geral"
                icon="engineering"
              />
            }

            <!-- 3. INDICADORES & 4. CATÁLOGO (Admin ou Almoxarifado + Tramitador) -->
            @if (canAcessarGestaoManutencao()) {
              <app-link-sidebar
                toolTip="Painel de Indicadores"
                link="/manutencao/dashboard"
                [onOpen]="isOpen()"
                label="Indicadores"
                icon="insights"
              />

              <app-link-sidebar
                toolTip="Catálogo de Serviços"
                link="/manutencao/catalogo"
                [onOpen]="isOpen()"
                label="Catálogo"
                icon="category"
              />
            }
          </div>
        </div>
      }
      <!-- Menu Relatórios-->
      @if (authStore.canManager()) {
        <div class="flex flex-col">
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
            <app-link-sidebar
              toolTip="Rel. Auditoria"
              link="/relatorios/auditoria"
              [onOpen]="isOpen()"
              label="Auditoria"
              icon="change_history"
            />

            @if (authStore.canEdit()) {
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
                toolTip="Rel. Certificados Vinculados"
                label="Certificados"
                icon="verified_user"
                [onOpen]="isOpen()"
                (actionClick)="openCertificadosReport()"
              />

              <app-link-sidebar
                toolTip="Rel. Sistemas Vinculados"
                label="Sistemas"
                icon="dns"
                [onOpen]="isOpen()"
                (actionClick)="openSistemasReport()"
              />
            }

            @if (authStore.canManager() || authStore.canContab()) {
              <app-link-sidebar
                toolTip="Controle de Ponto Eletrônico"
                link="relatorios/ponto-eletronico"
                [onOpen]="isOpen()"
                label="Ponto Eletrônico"
                icon="timer"
              />
            }
          </div>
        </div>
      }
    </nav>
  `
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

  // ==========================================
  // REGRAS RBAC PARA O MÓDULO DE MANUTENÇÃO
  // ==========================================
  /** Operador do Almoxarifado: exige ambas as roles 'almoxarifado' E 'tramitador' */
  readonly isAlmoxarifadoTramitador = computed(() =>
    this.authStore.isAlmoxarifado() && this.authStore.isTramitador()
  );

  /** Solicitante: Não é 'admin', não é 'almoxarifado' e possui a role 'manutencao' */
  readonly isSolicitanteManutencao = computed(() =>
    !this.authStore.canManager() &&
    !this.authStore.isAlmoxarifado() &&
    this.authStore.isManutencao()
  );

  /** Visualização do Menu Principal 'Manutenção' */
  readonly canAcessarMenuManutencao = computed(() =>
    this.authStore.canManager() ||
    this.isAlmoxarifadoTramitador() ||
    this.isSolicitanteManutencao()
  );

  /** Submenu 'Meus Chamados': Admin OU Solicitante */
  readonly canAcessarMeusChamados = computed(() =>
    this.authStore.canManager() || this.isSolicitanteManutencao()
  );

  /** Submenu 'Fila Geral': Apenas Almoxarifado + Tramitador */
  readonly canAcessarFilaGeral = computed(() =>
    this.isAlmoxarifadoTramitador()
  );

  /** Submenus 'Indicadores' e 'Catálogo': Admin OU Almoxarifado + Tramitador */
  readonly canAcessarGestaoManutencao = computed(() =>
    this.authStore.canManager() || this.isAlmoxarifadoTramitador()
  );

  toggleSubmenu(menu: string) {
    this.openMenus.update((menus) => ({
      ...menus,
      [menu]: !menus[menu]
    }));
  }

  openBirthdayReport() {
    const dialogRef = this.dialog.open(MesAniversarioModalComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
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
        panelClass: 'custom-dialog',
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
            setorId: filtros.setorId,
            setorIds: filtros.setorIds && filtros.setorIds.length > 0
              ? filtros.setorIds
              : null
          }
        });
      }
    });
  }

  openCertificadosReport() {
    const dialogRef = this.dialog.open(CertificadosVinculadosModalComponent, {
      width: '450px',
      panelClass: 'custom-dialog',
      disableClose: true,
      injector: this.injector
    });

    dialogRef.afterClosed().subscribe((filtros) => {
      if (filtros) {
        this.router.navigate(['/relatorios/certificados-vinculados'], {
          queryParams: {
            procuradores: filtros.procuradores && filtros.procuradores.length > 0
              ? filtros.procuradores
              : null
          }
        });
      }
    });
  }

  openSistemasReport() {
    const dialogRef = this.dialog.open(SistemasVinculadosModalComponent, {
      width: '450px',
      panelClass: 'custom-dialog',
      disableClose: true,
      injector: this.injector
    });

    dialogRef.afterClosed().subscribe((filtros) => {
      if (filtros) {
        this.router.navigate(['/relatorios/sistemas-vinculados'], {
          queryParams: {
            sistemas: filtros.sistemas && filtros.sistemas.length > 0
              ? filtros.sistemas
              : null
          }
        });
      }
    });
  }
}
