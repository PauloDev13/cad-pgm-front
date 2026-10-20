import { ChangeDetectionStrategy, Component, computed, effect, inject, output, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/store/auth.store';
import { MatBadgeModule } from '@angular/material/badge';
import { ServidoresStore } from '../../../features/servidor/store/servidor.store';
import { ServidorService } from '../../../features/servidor/services/servidor.service';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    RouterLink,
    MatBadgeModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar
      class="flex justify-between !bg-blue-500 items-center shadow-sm z-50 relative h-16 !px-2 md:!px-4">

      <div class="flex items-center min-w-0 flex-1">
        <button
          mat-icon-button
          (click)="toggleSidebar.emit()"
          aria-label="Toggle menu"
          class="group !w-12 !h-12 flex justify-center items-center !text-gray-50 shrink-0"
        >
          <mat-icon class="group-hover:!text-white group-hover:scale-125 transition-all duration-200">
            menu
          </mat-icon>
        </button>
        <span routerLink="/" class="text-sm sm:text-[18px] sm:text-base text-gray-50 cursor-pointer truncate min-w-0">
          PREFEITURA MUNICIPAL DO NATAL - Procuradoria Geral do Município - MÓDULO
          {{
            authStore.canManager()
              ? ' ADMINISTRADOR'
              : authStore.canContab()
                ? ' CONTABILIDADE'
                : ' RECURSOS HUMANOS'
          }}
        </span>
      </div>

      <div class="flex items-center justify-end gap-1 sm:gap-2 shrink-0 ml-auto">
        @if (canManager()) {
          <button
            (click)="navegarParaPendentes()"
            class="group !w-10 !h-10 sm:!w-12 sm:!h-12 flex justify-center items-center !text-gray-50 shrink-0"
            mat-icon-button
            aria-label="Notificações">
            <mat-icon
              aria-hidden="false"
              [matBadge]="servidoresStore.totalPendentes()"
              [matBadgeHidden]="servidoresStore.totalPendentes() === 0"
              matBadgeColor="warn"
              class="group-hover:!text-white group-hover:scale-125 transition-all duration-200">
              notifications
            </mat-icon>
          </button>
        }

        <button
          mat-button
          [matMenuTriggerFor]="userMenu"
          class="group !px-2 sm:!px-3 !min-w-0 !text-gray-50 !h-11 rounded-full
                hover:bg-blue-600/40 transition-colors shrink-0"
          aria-label="Menu do usuário"
        >
          <!-- Container flex interno: blinda a ordem e o alinhamento contra a projeção do Angular Material -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <!-- 1. Imagem do Avatar à direita de notificações -->
            <div
              class="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-blue-700/50
                    ring-2 ring-white/60 group-hover:ring-white transition-all shrink-0">
              <img
                [src]="photoUrl()"
                [alt]="loggedUserName() || 'Avatar do usuário'"
                (error)="onPhotoError()"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <!-- 2. Ícone da Setinha à direita do avatar -->
            <mat-icon class="!text-white !m-0 !w-5 !h-5 !text-[20px] flex items-center justify-center shrink-0">
              arrow_drop_down
            </mat-icon>

            <!-- 3. Nome do usuário autenticado à direita da setinha -->
            <span
              class="inline-block font-medium group-hover:text-white group-hover:font-semibold truncate
                    max-w-[80px] sm:max-w-[150px] lg:max-w-[200px] self-center select-none">
              {{ loggedUserName() }}
            </span>
          </div>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item class="menu-item-header">
            <mat-icon>person</mat-icon>
            <span>Meu Perfil</span>
          </button>

          @if (!authStore.canContab()) {
            <button
              mat-menu-item
              [matMenuTriggerFor]="subMenuFeriados"
              class="menu-item-header">
              <mat-icon>settings</mat-icon>
              <span>Configurações</span>
            </button>
          }

          <mat-divider></mat-divider>

          <button (click)="logout()" mat-menu-item class="menu-item-header">
            <mat-icon>logout</mat-icon>
            <span>Sair do Sistema</span>
          </button>
        </mat-menu>

        <!-- Definição do submenu de Configurações -->
        <mat-menu #subMenuFeriados="matMenu">
          <button
            mat-menu-item
            routerLink="/cadastros/feriados"
            class="menu-item-header"
          >
            <mat-icon>event</mat-icon>
            <span>Feriados</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `
})
export class HeaderComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly servidoresStore = inject(ServidoresStore);
  private readonly servidorService = inject(ServidorService);
  private readonly router = inject(Router);

  protected readonly DEFAULT_PHOTO = '/img/default_photo.jpg';

  // Emite o evento de clique para o layout principal
  toggleSidebar = output<void>();

  // Guarda a URL da foto
  photoUrl = signal<string | null>(this.DEFAULT_PHOTO);

  // Retorna o usuário logado
  loggedUserName = computed(() => this.authStore.currentUser()?.sub || '');

  // Retorna verdadeiro se o usuário logado é admin
  canManager = this.authStore.canManager;

  // Flag para impedir loops caso o fallback também falhe
  private hasFallbackFailed = false;

  constructor() {
    // Reage automaticamente à mudança ou limpeza do ID do Servidor na AuthStore
    effect(async () => {
      const idUserLogged = this.authStore.idUserLogged();
      this.hasFallbackFailed = false;

      if (!idUserLogged) {
        this.photoUrl.set(this.DEFAULT_PHOTO)
      } else {
        const url = await this.servidorService.loadPhotoServidor(idUserLogged);
        this.photoUrl.set(url);
      }
    });
  }

  /**
   * Tratamento de falha de carregamento da imagem (erro de rede, bloqueador de anúncio, offline)
   */
  onPhotoError(): void {
    if (!this.hasFallbackFailed) {
      this.hasFallbackFailed = true;
      this.photoUrl.set(this.servidorService.defaultFallbackPhoto);
    }
  }

  navegarParaPendentes(): void {
    if (this.servidoresStore.totalPendentes() > 0) {
      this.router.navigate(['servidores'], {
        queryParams: { statusId: 4 }
      });
    }
  }

  // Sai da aplicação e apaga o token
  logout() {
    this.authStore.logout();
  }
}
