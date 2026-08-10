import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/store/auth.store';
import { MatBadgeModule } from '@angular/material/badge';
import { ServidoresStore } from '../../../features/servidor/store/servidor.store';

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
          PREFEITURA MUNICIPAL DO NATAL - Procuradoria Geral do Município
        </span>
      </div>

      <div class="flex items-center gap-1 sm:gap-2 shrink-0">
        @if (canManager) {
          <button
            (click)="navegarParaPendentes()"
            class="group !w-10 !h-10 sm:!w-12 sm:!h-12 flex justify-center items-center !text-gray-50"
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

        <button mat-button [matMenuTriggerFor]="userMenu"
                class="flex items-center gap-1 sm:gap-2 group !px-2 sm:!px-4 !min-w-0 !text-gray-50">
          <mat-icon class="group-hover:!text-white group-hover:!scale-125 transition-all duration-200 !m-0">
            account_circle
          </mat-icon>

          <span
            class="inline font-medium group-hover:text-white group-hover:font-semibold truncate
                  max-w-[80px] sm:max-w-[150px] lg:max-w-[200px]">
        {{ loggedUserName() }}
      </span>

          <mat-icon class="!text-white !m-0 hidden sm:block">arrow_drop_down</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item class="menu-item-header">
            <mat-icon>person</mat-icon>
            <span>Meu Perfil</span>
          </button>
          <button mat-menu-item class="menu-item-header">
            <mat-icon>settings</mat-icon>
            <span>Configurações</span>
          </button>
          <mat-divider></mat-divider>
          <button (click)="logout()" mat-menu-item class="menu-item-header">
            <mat-icon>logout</mat-icon>
            <span>Sair do Sistema</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `
})
export class HeaderComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly servidoresStore = inject(ServidoresStore);
  private readonly router = inject(Router);

  // Emite o evento de clique para o layout principal
  toggleSidebar = output<void>();

  // Retorna o usuário logado
  loggedUserName = computed(() => this.authStore.currentUser()?.sub || '');

  // Retorna verdadeiro se o usuário logado é admin
  canManager = this.authStore.canManager();

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
