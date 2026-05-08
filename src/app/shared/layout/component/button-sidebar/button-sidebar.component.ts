import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button-sidebar',
  imports: [
    MatIconModule,
    MatTooltipModule,
    NgClass
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      (click)="onToggleSubmenu('relatorio')"
      class="flex items-center h-12 w-full cursor-pointer transition-colors group relative justify-center px-0"
      [ngClass]="onOpen() ? 'md:px-4 md:justify-between' : 'md:px-0 md:justify-center'"
      matTooltip="{{toolTips()}}"
      matTooltipPosition="right"
      [matTooltipDisabled]="onOpen()"
      matTooltipClass="tooltip-blue"
    >
      <div class="flex items-center group-hover:text-blue-700">
        <mat-icon class="text-gray-700 group-hover:scale-125 transition-all duration-200">
          {{ iconMenu() }}
        </mat-icon>
        @if (onOpen()) {
          <span
            class="ml-4 font-medium group-hover:font-semibold hidden md:block whitespace-nowrap">
                  {{ label() }}
                </span>
        }
      </div>

      <mat-icon
        class="text-gray-400 transition-transform duration-300 group-hover:!text-blue-700 shrink-0"
        [class.rotate-180]="onOpenMenus()['relatorio']"
        [ngClass]="onOpen() ? '-ml-1 md:ml-0 scale-75 md:scale-100' : '-ml-1 scale-75'"
      >
        expand_more
      </mat-icon>
    </button>
  `
})
export class ButtonSidebarComponent {
  toggleSubmenu = output<string>();
  onOpen = input.required<boolean>();
  onOpenMenus = input.required<Record<string, boolean>>();
  iconMenu = input.required<string>();
  label = input.required<string>();
  toolTips = input.required<string>();

  onToggleSubmenu(value: string) {
    this.toggleSubmenu.emit(value);
  }
}
