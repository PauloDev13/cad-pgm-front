import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BaseEntityDTO } from '../models/servidor.model';

@Component({
  selector: 'app-data-info',
  imports: [],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full print:break-inside-avoid">
  <span class="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 print:text-gray-700">
    {{ label() }}
  </span>

      <div class="flex flex-wrap gap-2">
        @for (value of data(); track value.id) {
          <span class="{{ spanClass() }} print:border print:border-gray-300 print:text-black print:bg-gray-100">
        {{ value.nome || value.email }}
      </span>
        } @empty {
          <span class="text-sm text-gray-500 italic print:text-gray-600">
        Nenhum {{ emptyMessage() }} vinculado
      </span>
        }
      </div>
    </div>
  `
})
export class DataInfoComponent {
  data = input.required<BaseEntityDTO[] | undefined>();
  label = input.required<string>();
  spanClass = input.required<string>();
  emptyMessage = input.required<string>();
}
