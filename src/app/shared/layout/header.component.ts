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
      class="flex justify-between items-center shadow-md z-50 relative h-16"
    >
      <div class="flex items-center gap-4">
        <button mat-icon-button (click)="toggleSidebar.emit()" aria-label="Toggle menu">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="text-xl font-semibold tracking-wide">Procuradoria Geral do Município</span>
      </div>

      <div class="flex items-center gap-2">
        <button mat-icon-button aria-label="Notificações">
          <mat-icon>notifications</mat-icon>
        </button>

        <button mat-button [matMenuTriggerFor]="userMenu" class="flex items-center gap-2">
          <mat-icon>account_circle</mat-icon>
          <span class="hidden md:inline font-medium">Administrador</span>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item>
            <mat-icon>person</mat-icon>
            <span>Meu Perfil</span>
          </button>
          <button mat-menu-item>
            <mat-icon>settings</mat-icon>
            <span>Configurações</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item>
            <mat-icon>logout</mat-icon>
            <span>Sair do Sistema</span>
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
