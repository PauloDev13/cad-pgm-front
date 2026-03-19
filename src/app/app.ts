import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import ServidorListComponent from './features/servidores/list/servidor-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('cad-pgm-front');
}
