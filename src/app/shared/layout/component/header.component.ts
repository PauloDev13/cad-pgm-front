import { Component, computed, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  standalone: true,
  template: `
    <mat-toolbar
      color="primary"
      class="flex justify-between !bg-gray-50 items-center shadow-sm z-50 relative h-16"
    >
      <div class="flex items-center">
        <button
          mat-icon-button
          (click)="toggleSidebar.emit()"
          aria-label="Toggle menu"
          class="group"
        >
          <mat-icon
            class="group-hover:!text-blue-700 group-hover:scale-125 transition-all duration-200"
          >
            menu
          </mat-icon>
        </button>
      </div>

      <div class="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        <img
          src="/img/logo.png"
          alt="Logo Prefeitura Municipal de Natal"
          class="h-10 w-auto object-contain cursor-pointer drop-shadow-sm hover:scale-105 transition-transform duration-200"
        />
        <span
          class="text-2xl md:text-3xl font-semibold tracking-tight text-center
                      text-blue-900 leading-tight sm:block"
        >
          Prefeitura Municipal de Natal
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button class="group" mat-icon-button aria-label="Notificações">
          <mat-icon
            class="group-hover:!text-blue-700 group-hover:scale-125 transition-all duration-200"
          >
            notifications
          </mat-icon>
        </button>

        <button mat-button [matMenuTriggerFor]="userMenu" class="flex items-center gap-2 group">
          <mat-icon
            class="group-hover:!text-blue-700 group-hover:!scale-125 transition-all duration-200"
          >
            account_circle
          </mat-icon>
          <span
            class="hidden md:inline font-medium group-hover:text-blue-700 group-hover:font-semibold"
          >
            {{ loggedUserName() }}
          </span>
          <mat-icon class="!text-blue-700"> arrow_drop_down</mat-icon>
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
            <span> Sair do Sistema </span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: ``,
})
export class HeaderComponent {
  // Emite o evento de clique para o layout principal
  toggleSidebar = output<void>();
  private readonly authService = inject(AuthService);
  // Retorna o usuário logado
  loggedUserName = computed(() => this.authService.currentUser()?.userName || '');
  // loggedUserName = computed(() => this.authService.getStoredLoggedUser()?.userName);

  private readonly router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['login']).then();
  }
}
