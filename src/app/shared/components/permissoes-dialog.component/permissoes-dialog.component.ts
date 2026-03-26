import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DominioService } from '../../../core/services/dominio.service';
import { BaseEntityDTO } from '../../../core/models/servidor.model';

// Interface para os dados que entram e saem do Dialog
export interface PermissoesDialogData {
  sistemaIds: number[];
  aliasIds: number[];
  procuradorIds: number[];
}

@Component({
  selector: 'app-permissoes-dialog',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule],
  standalone: true,
  template: `
    <h2 mat-dialog-title class="!text-2xl font-bold text-gray-800 border-b pb-2">
      Gerenciar Permissões e Vínculos
    </h2>

    <mat-dialog-content class="!pt-6 !pb-4 flex flex-col gap-6">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Sistemas de Acesso</mat-label>
        <mat-select multiple [(value)]="selectedSistemas">
          @for (sistema of listas.sistemas(); track sistema.id) {
            <mat-option [value]="sistema.id">{{ sistema.nome }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <!--      <mat-form-field appearance="outline" class="w-full">-->
      <!--        <mat-label>Procuradores Vinculados</mat-label>-->
      <!--        <mat-select multiple [(value)]="selectedProcuradores">-->
      <!--          @for (proc of listas.procuradores(); track proc.id) {-->
      <!--            <mat-option [value]="proc.id">{{ proc.nome }}</mat-option>-->
      <!--          }-->
      <!--        </mat-select>-->
      <!--      </mat-form-field>-->

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Aliases de E-mail</mat-label>
        <mat-select multiple [(value)]="selectedAliases">
          @for (alias of listas.aliases(); track alias.id) {
            <mat-option [value]="alias.id">{{ alias.email }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!pr-6 !pb-6">
      <button mat-button (click)="cancelar()" class="text-gray-600">Cancelar</button>
      <button mat-flat-button class="!bg-blue-600 text-white ml-2" (click)="confirmar()">
        Confirmar Seleção
      </button>
    </mat-dialog-actions>
  `,
})
export class PermissoesDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<PermissoesDialogComponent>);
  readonly data = inject<PermissoesDialogData>(MAT_DIALOG_DATA);
  readonly dominioService = inject(DominioService);

  // Sinais para guardar as listas que vêm do banco
  listas = {
    sistemas: signal<BaseEntityDTO[]>([]),
    procuradores: signal<BaseEntityDTO[]>([]),
    aliases: signal<BaseEntityDTO[]>([]),
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
      aliasIds: this.selectedAliases,
    } as PermissoesDialogData);
  }
}
