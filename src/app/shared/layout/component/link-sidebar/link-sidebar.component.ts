import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-link-sidebar',
  imports: [
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
    NgClass
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a routerLink="{{ link() }}" routerLinkActive="bg-blue-50 text-blue-600"
       class="menu-subitem group flex items-center h-12 w-full transition-colors justify-center px-0"
       [ngClass]="onOpen() ? 'md:pl-12 md:justify-start' : 'md:px-0 md:justify-center'"
       matTooltip="{{toolTip()}}" matTooltipPosition="right" [matTooltipDisabled]="onOpen()"
       matTooltipClass="tooltip-blue">
      <mat-icon>{{ icon() }}</mat-icon>
      @if (onOpen()) {
        <span class="ml-4 hidden md:inline whitespace-nowrap">{{ label() }}</span>
      }
    </a>
  `
})
export class LinkSidebarComponent {
  onOpen = input.required<any>();
  label = input.required<string>();
  toolTip = input.required<string>();
  link = input.required<string>();
  icon = input.required<string>();
}
