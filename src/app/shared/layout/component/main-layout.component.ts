import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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

      <app-header class="print:hidden shrink-0" (toggleSidebar)="toggle()"></app-header>

      <div class="flex print:block flex-1 overflow-hidden print:overflow-visible relative min-h-0">

        <aside
          class="print:hidden bg-gray-100 border-r border-gray-300 transition-all shadow-2xl
                  md:shadow-xl duration-300 ease-in-out flex flex-col overflow-y-auto
                  overflow-x-hidden absolute md:relative z-40 h-full w-64"
          [ngClass]="isSidebarOpen()
            ? 'translate-x-0 md:w-64'
            : '-translate-x-full md:translate-x-0 md:w-20'"
        >
          <app-sidebar [isOpen]="isSidebarOpen()"></app-sidebar>
        </aside>

        @if (isSidebarOpen() && isHandset()) {
          <button
            type="button"
            aria-label="Fechar menu"
            class="fixed inset-0 z-30 bg-black/40 md:hidden"
            (click)="toggle()"
          ></button>
        }

        <main
          class="flex-1 print:block flex flex-col overflow-hidden print:overflow-visible
                 transition-all duration-300 w-full">
          <div class="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden
                      print:overflow-visible p-2 md:p-2 print:p-0">
            <router-outlet></router-outlet>
          </div>

          <app-footer class="print:hidden shrink-0"></app-footer>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  private readonly servidorStore = inject(ServidoresStore);
  private readonly authStore = inject(AuthStore);
  private readonly notificationService = inject(NotificationService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Guarda o último valor do total de registro com Status = Pendente
  private lastValue = 0;

  // Indica se a tela é mobile (até 767.98px). No mobile a SideBar vira "gaveta" sobre o conteúdo.
  isHandset = toSignal(
    this.breakpointObserver.observe(['(max-width: 767.98px)']).pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  // Controla a abertura e fechamento da SideBar
  isSidebarOpen = signal(!this.isHandset());

  constructor() {
    effect(() => {
      // Ao cruzar a quebra de breakpoint, restaura o estado esperado:
      // desktop aberto (expandido), mobile fechado (gaveta oculta).
      this.isSidebarOpen.set(!this.isHandset());
    });

    effect(() => {
      // Pega o total de registros com o Status igual a "pendente"
      const total = this.servidorStore.totalPendentes();

      // Retorna verdadeiro se o usuário logado é "admin"
      const isAdmin = this.authStore.canManager();

      // CLÁUSULA DE GUARDA: Se o usuário não é ADMIN, aborta.
      if (!isAdmin) return;

      // CLÁUSULA DE GUARDA: Se o usuário não é ADMIN e o Total é igual a zero (0), aborta.
      if (isAdmin && total !== this.lastValue) {
        // Se passou pela CLÁUSULA DE GUARDA, verifica se o total é maior que zero
        if (total > 0) {
          // Se SIM, exibe a mensagem com o total
          this.showNotification(total);
        } else {
          // Se for menor, exibe mensagem informando não haver mais pendências
          this.notificationService.info(
            `Não há mais Servidores com Status Pendente`,
            'Aviso de Pendências', { duration: 3000 }
          );
        }
      }

      // Atualiza o valor anterior do total
      this.lastValue = total;
    });
  }

  toggle() {
    this.isSidebarOpen.update((v) => !v);
  }

  private showNotification(total: number) {
    // Cria a mensagem
    const msg = total > 1
      ? `Existem <strong>(${total})</strong> novos cadastros de servidores`
      : 'Existe <strong>(1)</strong> novo cadastro de servidor';

    // Exibe a mensagem
    this.notificationService.warning(
      `${msg} aguardando a sua avaliação.`,
      'Alerta de Pendências', { duration: 5000 }
    );
  }
}
