import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
  ],
  standalone: true,
  template: `
    <mat-sidenav-container class="layout-container" [class.menu-collapsed]="collapsed()">
      <mat-sidenav mode="side" opened>
        <div class="menu-header">
          <button mat-icon-button (click)="toggleMenu()">
            <mat-icon>menu</mat-icon>
          </button>
          @if (!collapsed()) {
            <span class="logo-text">Meu Sistema</span>
          }
        </div>

        <mat-nav-list>
          <a mat-list-item routerLink="/inicio" routerLinkActive="active-link">
            <mat-icon matListItemIcon>home</mat-icon>
            @if (!collapsed()) {
              <span matListItemTitle>Início</span>
            }
          </a>

          <mat-expansion-panel class="menu-panel" [disabled]="collapsed()">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>manage_accounts</mat-icon>
                @if (!collapsed()) {
                  <span>Gerenciamento</span>
                }
              </mat-panel-title>
            </mat-expansion-panel-header>
            <mat-nav-list class="submenu">
              <a mat-list-item routerLink="/servidores" routerLinkActive="active-link">
                Cadastrar Servidor
              </a>
            </mat-nav-list>
          </mat-expansion-panel>

          <mat-expansion-panel class="menu-panel" [disabled]="collapsed()">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>post_add</mat-icon>
                @if (!collapsed()) {
                  <span>Cadastro</span>
                }
              </mat-panel-title>
            </mat-expansion-panel-header>
            <mat-nav-list class="submenu">
              <a mat-list-item routerLink="/cadastro/cargo">Cargo</a>
              <a mat-list-item routerLink="/cadastro/setor">Setor</a>
              <a mat-list-item routerLink="/cadastro/vinculo">Vínculo</a>
              <a mat-list-item routerLink="/cadastro/status">Status</a>
            </mat-nav-list>
          </mat-expansion-panel>

          <mat-expansion-panel class="menu-panel" [disabled]="collapsed()">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>admin_panel_settings</mat-icon>
                @if (!collapsed()) {
                  <span>Permissões</span>
                }
              </mat-panel-title>
            </mat-expansion-panel-header>
            <mat-nav-list class="submenu">
              <a mat-list-item routerLink="/permissoes/procurador">Cadastro de Procurador</a>
              <a mat-list-item routerLink="/permissoes/sistemas">Cadastro de Sistemas</a>
              <a mat-list-item routerLink="/permissoes/alias">Cadastro de Alias</a>
            </mat-nav-list>
          </mat-expansion-panel>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: ``,
})
export class MainLayoutComponent {
  // Signal que controla se o menu está aberto ou apenas ícones
  collapsed = signal<boolean>(false);

  toggleMenu() {
    this.collapsed.update((val) => !val);
  }
}
