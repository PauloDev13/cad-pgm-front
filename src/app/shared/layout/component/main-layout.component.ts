import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from './footer.component';
import { ServidoresStore } from '../../../features/servidor/store/servidor.store';
import { NotificationService } from '../../service/NotificationSnackbar.service';
import { AuthStore } from '../../../core/auth/store/auth.store';

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
          <div class="flex flex-col flex-1 min-h-0 overflow-hidden print:overflow-visible p-2
                      md:p-2 print:p-0">
            <router-outlet></router-outlet>
          </div>

          <app-footer class="print:hidden"></app-footer>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  private readonly servidorStore = inject(ServidoresStore);
  private readonly authStore = inject(AuthStore);
  private readonly notificationService = inject(NotificationService);

  // Garante que a mensagem será exibida apenas uma vez
  private hasNotified: boolean = false;

  isSidebarOpen = signal(true);

  constructor() {
    effect(() => {
      // Pega o total de registros com o Status igual a "pendente"
      const total = this.servidorStore.totalPendentes();

      const isAdmin = this.authStore.canManager();

      // Quando o total for maior que zero e a mensagem não foi exibida nenhuma vez
      if (total > 0 && !this.hasNotified && isAdmin) {
        // Cria a mensagem
        const msg = total > 1
          ? `Existem <strong>(${total})</strong> novos cadastros de servidores`
          : 'Existe <strong>(1)</strong> novo cadastro de servidor';

        // Exibe a mensagem
        this.notificationService.warning(
          `${msg} aguardando a sua avaliação.`,
          'Aviso de Pendências', { duration: 5000 }
        );

        // Avisa que a mensagem já foi exibida e não permite nova exibição
        this.hasNotified = true;
      }
    });
  }

  toggle() {
    this.isSidebarOpen.update((v) => !v);
  }
}
