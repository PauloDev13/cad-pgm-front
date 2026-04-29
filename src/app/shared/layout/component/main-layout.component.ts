import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, HeaderComponent, SidebarComponent, FooterComponent, NgClass],
  template: `
    <div class="h-screen print:h-auto flex flex-col overflow-hidden print:overflow-visible
                bg-gray-50 text-gray-800 relative">

      <app-header class="print:hidden" (toggleSidebar)="toggle()"></app-header>

      <div class="flex print:block flex-1 overflow-hidden print:overflow-visible relative">

        <aside
          class="print:hidden bg-gray-100 border-r border-gray-300 transition-all shadow-2xl
                  md:shadow-xl duration-300 ease-in-out flex flex-col overflow-y-auto
                  overflow-x-hidden absolute md:relative z-40 h-full"
          [ngClass]="isSidebarOpen() ? 'w-20 md:w-64' : 'w-20'"
        >
          <app-sidebar [isOpen]="isSidebarOpen()"></app-sidebar>
        </aside>

        <main
          class="flex-1 print:block flex flex-col overflow-hidden print:overflow-visible
                 transition-all duration-300 pl-20 md:pl-0 w-full">
          <div class="flex-1 overflow-y-auto print:overflow-visible p-2 md:p-2 print:p-0">
            <router-outlet></router-outlet>
          </div>

          <app-footer class="print:hidden"></app-footer>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  isSidebarOpen = signal(true);

  toggle() {
    this.isSidebarOpen.update((v) => !v);
  }
}
