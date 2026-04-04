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
    <div
      class="h-screen print:h-auto flex flex-col overflow-hidden
            print:overflow-visible bg-gray-50 text-gray-800"
    >
      <!-- exibe a barra do cabeçalho-->
      <app-header class="print:hidden" (toggleSidebar)="toggle()"></app-header>

      <div class="flex print:block flex-1 overflow-hidden print:overflow-visible">
        <aside
          class="print:hidden bg-gray-100 border-r border-gray-300 transition-all shadow-xl
          duration-300 ease-in-out flex flex-col overflow-y-auto overflow-x-hidden"
          [class.w-64]="isSidebarOpen()"
          [class.w-20]="!isSidebarOpen()"
        >
          <app-sidebar [isOpen]="isSidebarOpen()"></app-sidebar>
        </aside>

        <main
          class="flex-1 print:block flex flex-col overflow-hidden
                    print:overflow-visible transition-all duration-300"
        >
          <div class="flex-1 overflow-y-auto print:overflow-visible p-4 md:p-6 print:p-0">
            <router-outlet></router-outlet>
          </div>

          <app-footer class="print:hidden"></app-footer>
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
