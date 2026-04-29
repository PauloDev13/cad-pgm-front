import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-data-display',
  imports: [
    NgxMaskPipe
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full print:break-inside-avoid">
      <span class="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5 print:text-gray-700">
        {{ label() }}
      </span>
      <span class="text-sm sm:text-base text-gray-800 font-medium break-words print:text-black">
        @if (maskPattern(); as maskPattern) {
          {{ ((fieldData() ?? '') | mask: maskPattern) || 'Não informado' }}
        } @else {
          {{ fieldData() || 'Não informado' }}
        }
      </span>
    </div>
  `
})
export class DataDisplayComponent {
  label = input.required<string>();
  fieldData = input.required<string | number | null | undefined>();
  maskPattern = input<string>();
}
