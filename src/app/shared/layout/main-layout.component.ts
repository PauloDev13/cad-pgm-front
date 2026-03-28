import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
// ✨ REPARAMOS O IMPORT: Removemos o MatSidenavModule completamente!
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="h-screen flex flex-col overflow-hidden bg-gray-50 text-gray-800">
      <app-header (toggleSidebar)="toggle()"></app-header>

      <div class="flex flex-1 overflow-hidden">
        <aside
          class="bg-white border-r border-gray-300 transition-all shadow-xl
          duration-300 ease-in-out flex flex-col overflow-y-auto overflow-x-hidden"
          [class.w-64]="isSidebarOpen()"
          [class.w-20]="!isSidebarOpen()"
        >
          <app-sidebar [isOpen]="isSidebarOpen()"></app-sidebar>
        </aside>

        <main class="flex-1 flex flex-col overflow-y-auto transition-all duration-300">
          <div class="flex-1 p-6 md:p-8">
            <router-outlet></router-outlet>
          </div>

          <app-footer></app-footer>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  isSidebarOpen = signal(true);

  toggle() {
    this.isSidebarOpen.update((v) => !v);
  }
}
