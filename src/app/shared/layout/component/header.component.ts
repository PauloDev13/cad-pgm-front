import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  styles: ``
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Emite o evento de clique para o layout principal
  toggleSidebar = output<void>();

  // Retorna o usuário logado
  loggedUserName = computed(() => this.authService.currentUser()?.userName || '');


  logout() {
    this.authService.logout();
    this.router.navigate(['auth/login']).then();
  }
}
