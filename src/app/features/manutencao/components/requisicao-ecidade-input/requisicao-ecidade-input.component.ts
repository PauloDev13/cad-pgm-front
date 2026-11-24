import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-requisicao-ecidade-input',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-2 w-full">
      <div class="flex items-stretch gap-2">
        <mat-form-field appearance="outline" class="w-full flex-1" subscriptSizing="dynamic">
          <mat-label>Nº Requisição e-Cidade (Opcional)</mat-label>
          <input
            matInput
            [(ngModel)]="inputValue"
            (keydown.enter)="$event.preventDefault(); adicionar()"
            placeholder="Ex: 002359/2026"
            maxlength="50"
          />
          <mat-hint class="text-xs text-gray-500">Pressione Enter ou clique em Adicionar</mat-hint>
        </mat-form-field>
        <button
          type="button"
          mat-flat-button
          class="!rounded-4xl !bg-blue-600 hover:!bg-blue-700 !text-white"
          (click)="adicionar()"
        >
          <mat-icon class="!mr-1">add</mat-icon>
        </button>
      </div>
      <!-- Alerta de Validação Local -->
      @if (mensagemErro()) {
        <span class="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
          <mat-icon class="!text-sm !w-4 !h-4">error_outline</mat-icon>
          {{ mensagemErro() }}
        </span>
      }
      <!-- Lista de Chips / Badges Adicionados -->
      @if (numeros().length > 0) {
        <div class="flex flex-wrap gap-2 mt-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
          @for (numero of numeros(); track numero) {
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                     bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
            >
              <mat-icon class="!text-sm !w-4 !h-4 text-blue-500">tag</mat-icon>
              {{ numero }}
              <button
                type="button"
                class="hover:text-rose-600 hover:bg-rose-50 rounded-full p-0.5 transition-colors focus:outline-none"
                (click)="remover(numero)"
                aria-label="Remover requisição"
              >
                <mat-icon class="!text-sm !w-4 !h-4">close</mat-icon>
              </button>
            </span>
          }
        </div>
      }
    </div>
  `
})
export class RequisicaoEcidadeInputComponent {
  readonly numeros = model<string[]>([]);
  readonly inputValue = signal<string>('');
  readonly mensagemErro = signal<string | null>(null);

  adicionar(): void {
    const valor = this.inputValue().trim();
    this.mensagemErro.set(null);

    if (!valor) {
      return;
    }

    if (valor.length > 50) {
      this.mensagemErro.set('O número da requisição não pode exceder 50 caracteres.');
      return;
    }

    if (this.numeros().includes(valor)) {
      this.mensagemErro.set(`A requisição "${valor}" já foi adicionada à lista.`);
      return;
    }

    this.numeros.update((lista) => [...lista, valor]);
    this.inputValue.set('');
  }

  remover(numero: string): void {
    this.numeros.update((lista) => lista.filter((item) => item !== numero));
    this.mensagemErro.set(null);
  }
}
