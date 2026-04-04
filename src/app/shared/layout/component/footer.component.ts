import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  standalone: true,
  template: `
    <footer
      class="bg-gray-100 shadow-sm shadow-gray-700 border-t
             border-gray-200 py-4 text-center text-sm text-gray-700"
    >
      <p>&copy; 2026 Sistema Administrativo Corporativo. Todos os direitos reservados.</p>
      <p class="text-xs mt-1">Desenvolvido pelo Departamento do TI/PGM - Versão 1.0.0</p>
    </footer>
  `,
})
export class FooterComponent {}
