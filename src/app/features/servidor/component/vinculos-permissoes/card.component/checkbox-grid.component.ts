import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-checkbox-grid',
  imports: [
    MatCheckboxModule, MatTooltipModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      @for (item of items(); track item[valueKey()]) {
        <div
          class="flex items-center gap-2 px-3 py-2 border rounded-md transition-colors hover:bg-blue-50"
          [class.bg-blue-50]="selectedIds().includes(item[valueKey()])"
          [class.border-blue-300]="selectedIds().includes(item[valueKey()])">

          <mat-checkbox
            color="primary"
            [checked]="selectedIds().includes(item[valueKey()])"
            (change)="toggle.emit({ id: item[valueKey()], checked: $event.checked })">
          </mat-checkbox>

          <span class="truncate block flex-1 min-w-0 text-sm font-medium text-gray-700"
                [class.text-blue-800]="selectedIds().includes(item[valueKey()])"
                [matTooltip]="getTooltip(item)"
                matTooltipPosition="below"
                [matTooltipDisabled]="!tooltipKey()">
            {{ item[displayKey()] }}
          </span>
        </div>
      }
    </div>
  `
})
export class CheckboxGridComponent {
  // A lista de dados vinda do backend/store
  items = input<any[]>();
  // O array com os IDs já selecionados
  selectedIds = input.required<number[]>();

  // Configurações das chaves do objeto (com valores padrão)
  valueKey = input<string>('id');
  displayKey = input<string>('nome');
  tooltipKey = input<string | null>(null);

  // O evento que avisa o pai sobre a mudança
  toggle = output<{ id: number; checked: boolean }>();

  // Função auxiliar para evitar erro caso o tooltipKey não seja informado
  getTooltip(item: any): string {
    const key = this.tooltipKey();
    return key ? item[key] : '';
  }
}
