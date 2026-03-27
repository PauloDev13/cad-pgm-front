import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterModule, MatSidenavModule, HeaderComponent, SidebarComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <div class="h-screen flex flex-col overflow-hidden bg-gray-50 text-gray-800">
      <app-header (toggleSidebar)="toggle()"></app-header>

      <mat-sidenav-container class="flex-1 bg-transparent">
        <mat-sidenav
          opened
          mode="side"
          class="border-r border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-x-hidden"
          [style.width.px]="isSidebarOpen() ? 256 : 80"
        >
          <app-sidebar [isOpen]="isSidebarOpen()"></app-sidebar>
        </mat-sidenav>

        <mat-sidenav-content
          class="flex flex-col h-full overflow-y-auto transition-all duration-300 ease-in-out"
          [style.margin-left.px]="isSidebarOpen() ? 200 : 0"
        >
          <main class="flex-1 p-6 md:p-8">
            <router-outlet></router-outlet>
          </main>

          <app-footer></app-footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: ``,
})
export class MainLayoutComponent {
  // Recebe o estado de aberto/fechado do MainLayout
  protected isSidebarOpen = signal(true);

  toggle() {
    this.isSidebarOpen.update((v) => !v);
  }
}
