import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BaseEntityDTO } from '../models/servidor.model';

@Component({
  selector: 'app-data-info',
  imports: [],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col print:break-inside-avoid">
      <span class="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
        {{ label() }}
      </span>
      <div class="flex flex-wrap gap-2">
        @for (value of data(); track value.id) {
          <span class="{{ spanClass() }}">
            {{ value.nome || value.email }}
          </span>
        } @empty {
          <span class="text-sm text-gray-600 italic">Nenhum {{ emptyMessage() }} vinculado</span>
        }
      </div>
    </div>
  `,
  styles: ``,
})
export class DataInfoComponent {
  data = input.required<BaseEntityDTO[] | undefined>();
  label = input.required<string>();
  spanClass = input.required<string>();
  emptyMessage = input.required<string>();
}
