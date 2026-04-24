import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DominioService } from '../../../features/servidor/services/dominio.service';
import { BaseEntityDTO } from '../../../features/servidor/models/servidor.model';
import { MatIconModule } from '@angular/material/icon';
import { CustomSelectComponent } from '../custom-select/custom-select.component';

// Interface para os dados que entram e saem do Dialog
export interface PermissoesDialogData {
  aliasIds: number[];
  procuradorIds: number[];
  sistemaIds: number[];
}

@Component({
  selector: 'app-permissoes-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    CustomSelectComponent
  ],
  standalone: true,
  template: `
    <div class="flex justify-between items-center px-6 pt-4 pb-2 border-b border-gray-200 mb-2">
      <h2 mat-dialog-title class="!font-bold !text-lg sm:!text-xl !text-blue-700 !m-0 !p-0">
        Gerenciar Permissões e Vínculos
      </h2>
      <button
        mat-icon-button
        mat-dialog-close
        aria-label="Fechar"
        class="!w-8 !h-8 !flex !items-center !justify-center !bg-blue-600 hover:!bg-blue-500 !transition-colors !duration-300"
      >
        <mat-icon class="!text-white !scale-90 !leading-none !m-0 !p-0">close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="!px-6 !pb-2 !pt-2 flex flex-col gap-4">
      <app-custom-select
        label="Sistemas de Acesso"
        [multiple]="true"
        [options]="listas.sistemas()"
        [(value)]="selectedSistemas"
      />
      <app-custom-select
        label="Procuradores Vinculados"
        [multiple]="true"
        [options]="listas.procuradores()"
        [(value)]="selectedProcuradores"
      />

      <app-custom-select
        label="Aliases de E-mail"
        [multiple]="true"
        [options]="listas.aliases()"
        [(value)]="selectedAliases"
      />
    </mat-dialog-content>

    <mat-dialog-actions
      class="!px-6 !pb-6 !pt-2 flex flex-col sm:flex-row sm:justify-end items-center gap-3">
      <button
        mat-stroked-button
        type="button"
        (click)="cancelar()"
        class="w-full sm:w-auto !border-blue-600 !text-blue-600 !transition-transform duration-300
               !ease-in-out hover:!scale-105 !h-12 sm:!h-10 order-2 sm:order-1"
      >
        <mat-icon>close</mat-icon>
        Cancelar
      </button>
      <button
        type="button"
        mat-flat-button
        [disabled]="!onDisabledButtonConfirm()"
        class="w-full sm:w-auto !bg-blue-600 !text-white !transition-transform duration-300
              !ease-in-out hover:!scale-105 disabled:!bg-gray-200 disabled:!cursor-not-allowed
               disabled:hover:!scale-100 disabled:!text-gray-400 disabled:!border-transparent
               !h-12 sm:!h-10 order-1 sm:order-2"
        (click)="confirmar()"
      >
        <mat-icon>checked</mat-icon>
        Confirmar Seleção
      </button>
    </mat-dialog-actions>
  `
})
export class PermissoesDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<PermissoesDialogComponent>);
  readonly data = inject<PermissoesDialogData>(MAT_DIALOG_DATA);
  readonly dominioService = inject(DominioService);

  // Sinais para guardar as listas que vêm do banco
  listas = {
    sistemas: signal<BaseEntityDTO[]>([]),
    procuradores: signal<BaseEntityDTO[]>([]),
    aliases: signal<BaseEntityDTO[]>([])
  };

  // Arrays locais para o two-way binding do MatSelect
  selectedSistemas: number[] = [];
  selectedProcuradores: number[] = [];
  selectedAliases: number[] = [];

  ngOnInit() {
    // Busca as listas disponíveis no backend (Certifique-se de criar esses métodos no DominioService)
    this.carregarDominios();

    // Pré-seleciona os valores que vieram do formulário pai
    this.selectedSistemas = [...this.data.sistemaIds];
    this.selectedProcuradores = [...this.data.procuradorIds];
    this.selectedAliases = [...this.data.aliasIds];
  }

  carregarDominios() {
    this.dominioService.getSistemas().subscribe((res) => this.listas.sistemas.set(res));
    this.dominioService.getProcuradores().subscribe((res) => this.listas.procuradores.set(res));
    this.dominioService.getAliases().subscribe((res) => this.listas.aliases.set(res));
  }

  cancelar() {
    this.dialogRef.close(); // Retorna undefined, cancelando a ação
  }

  confirmar() {
    // Retorna os novos arrays selecionados para o formulário pai
    this.dialogRef.close({
      sistemaIds: this.selectedSistemas,
      procuradorIds: this.selectedProcuradores,
      aliasIds: this.selectedAliases
    } as PermissoesDialogData);
  }

  onDisabledButtonConfirm(): boolean {
    return (
      this.selectedAliases.length > 0 ||
      this.selectedSistemas.length > 0 ||
      this.selectedProcuradores.length > 0
    );
  }
}
