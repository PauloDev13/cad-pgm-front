import { Component, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  standalone: true,
  template: `
    <mat-toolbar
      color="primary"
      class="flex justify-between !bg-blue-50 items-center shadow-md z-50 relative h-16"
    >
      <div class="flex items-center gap-4 group">
        <button mat-icon-button (click)="toggleSidebar.emit()" aria-label="Toggle menu">
          <mat-icon
            class="group-hover:!text-blue-700 group-hover:scale-125 transition-all duration-200"
            >menu
          </mat-icon>
        </button>
        <span class="text-xl text-blue-700 font-semibold tracking-wide"
          >Procuradoria Geral do Município</span
        >
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
            Administrador
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
          <button mat-menu-item class="menu-item-header">
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
}
