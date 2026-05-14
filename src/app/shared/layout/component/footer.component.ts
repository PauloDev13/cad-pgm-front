import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="bg-gray-100 shadow-sm shadow-gray-700 border-t border-gray-200 py-2 px-4
            flex flex-col md:flex-row items-center justify-center text-center font-semibold text-sm
            text-blue-900 gap-1 md:gap-2"
    >
      <p>
        &copy; 2026 Sistema Administrativo Corporativo. Todos os direitos reservados.
      </p>

      <span class="hidden md:inline text-blue-900">|</span>

      <p class="text-blue-900 font-medium">
        Desenvolvido pelo Departamento do TI/PGM - Versão 1.2.0
      </p>
    </footer>
  `
})
export class FooterComponent {
}
