import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="bg-gray-100 shadow-sm shadow-gray-700 border-t border-gray-200 py-4 px-4 flex
            flex-col items-center justify-center text-center text-sm text-gray-700"
    >
      <p
        class="leading-relaxed">
        &copy; 2026 Sistema Administrativo Corporativo. Todos os direitos reservados.
      </p>
      <p class="text-xs mt-1 md:mt-2 text-gray-500 font-medium">
        Desenvolvido pelo Departamento do TI/PGM - Versão 1.0.0
      </p>
    </footer>
  `
})
export class FooterComponent {
}
