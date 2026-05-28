import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ServidoresStore } from '../../store/servidor.store';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-vinculos-permissoes',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
    NgClass
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full pb-8">

      <div
        class="absolute inset-x-0 top-0 bottom-2 flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

        <div class="flex justify-between items-center px-4 pt-4 pb-3 border-b border-gray-200 shrink-0 bg-white z-10">
          <h2 class="!font-bold !text-lg sm:!text-xl !text-blue-700 !m-0 !p-0">
            Gerenciar Permissões e Vínculos
          </h2>
        </div>

        <div class="flex flex-col flex-1 min-h-0 overflow-y-auto gap-8 px-4 pt-4 pb-8 bg-gray-50/30">

          <div class="flex flex-col gap-3">
            <div>
              <h3 class="text-lg font-bold text-blue-800 m-0">Sistemas de Acesso</h3>
              <p class="text-sm text-gray-500 m-0">Selecione os sistemas que o servidor poderá operar.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              @for (sistema of servidoresStore.sistemas(); track sistema.id) {
                <div class="flex items-center px-3 py-2 border rounded-md transition-colors hover:bg-blue-50"
                     [class.bg-blue-50]="selectedSistemas.includes(sistema.id)"
                     [class.border-blue-300]="selectedSistemas.includes(sistema.id)">

                  <mat-checkbox
                    color="primary"
                    [checked]="selectedSistemas.includes(sistema.id)"
                    (change)="toggleSelection('sistemas', sistema.id, $event.checked)">
                <span class="text-sm font-medium text-gray-700"
                      [class.text-blue-800]="selectedSistemas.includes(sistema.id)">
                  {{ sistema.nome }}
                </span>
                  </mat-checkbox>
                </div>
              }
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="flex flex-col gap-3">
            <div>
              <h3 class="text-lg font-bold text-blue-800 m-0">Procuradores Vinculados</h3>
              <p class="text-sm text-gray-500 m-0">Selecione as autoridades representadas.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              @for (proc of servidoresStore.procuradores(); track proc.id) {
                <div
                  class="flex items-center px-3 py-2 border rounded-md transition-colors hover:bg-blue-50"
                  [class.bg-blue-50]="selectedProcuradores.includes(proc.id)"
                  [class.border-blue-300]="selectedProcuradores.includes(proc.id)">

                  <mat-checkbox
                    color="primary"
                    [checked]="selectedProcuradores.includes(proc.id)"
                    (change)="toggleSelection('procuradores', proc.id, $event.checked)">
                <span class="text-sm font-medium text-gray-700"
                      [class.text-blue-800]="selectedProcuradores.includes(proc.id)">
                  {{ proc.nome }}
                </span>
                  </mat-checkbox>
                </div>
              }
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="flex flex-col gap-3">
            <div>
              <h3 class="text-lg font-bold text-blue-800 m-0">E-mails (Alias) Vinculados</h3>
              <p class="text-sm text-gray-500 m-0">Selecione os e-mails e aliases de uso institucional.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              @for (alias of servidoresStore.aliases(); track alias.id) {

                <div
                  class="flex items-center gap-2 px-3 py-2 border rounded-md transition-colors hover:bg-blue-50"
                  [class.bg-blue-50]="selectedAliases.includes(alias.id)"
                  [class.border-blue-300]="selectedAliases.includes(alias.id)">

                  <mat-checkbox
                    color="primary"
                    [checked]="selectedAliases.includes(alias.id)"
                    (change)="toggleSelection('aliases', alias.id, $event.checked)">
                  </mat-checkbox>

                  <span class="truncate block flex-1 min-w-0 text-sm font-medium text-gray-700"
                        [class.text-blue-800]="selectedAliases.includes(alias.id)"
                        [matTooltip]="alias.email"
                        matTooltipPosition="below">
                {{ alias.email }}
              </span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `

})
export class VinculosPermissoesComponent implements OnInit {
  // Injeta a nossa Store unificada
  protected readonly servidoresStore = inject(ServidoresStore);

  // Recebe os IDs iniciais que já estão no modelo do formulário Pai
  initialSistemas = input.required<number[]>();
  initialProcuradores = input.required<number[]>();
  initialAliases = input.required<number[]>();

  // 3Emite as alterações de volta em tempo real para o Pai salvar tudo no submit único!
  permissionsChanged = output<{ sistemaIds: number[], procuradorIds: number[], aliasIds: number[] }>();

  // Arrays de controle local para o binding bidirecional do componente de tela
  selectedSistemas: number[] = [];
  selectedProcuradores: number[] = [];
  selectedAliases: number[] = [];


  ngOnInit() {
    // Sincroniza o estado interno do componente com o que o pai enviou
    this.selectedSistemas = [...this.initialSistemas()];
    this.selectedProcuradores = [...this.initialProcuradores()];
    this.selectedAliases = [...this.initialAliases()];
  }

  // Método inteligente para alternar itens nos arrays de permissão
  toggleSelection(listName: 'sistemas' | 'procuradores' | 'aliases', id: number, isChecked: boolean) {
    let targetArray: number[];

    if (listName === 'sistemas') targetArray = this.selectedSistemas;
    else if (listName === 'procuradores') targetArray = this.selectedProcuradores;
    else targetArray = this.selectedAliases;

    if (isChecked) {
      if (!targetArray.includes(id)) targetArray.push(id);
    } else {
      const index = targetArray.indexOf(id);
      if (index >= 0) targetArray.splice(index, 1);
    }

    this.emitChanges();
  }

  // Toda vez que o usuário marca/desmarca uma opção, avisa o formulário pai imediatamente
  emitChanges() {
    this.permissionsChanged.emit({
      sistemaIds: this.selectedSistemas,
      procuradorIds: this.selectedProcuradores,
      aliasIds: this.selectedAliases
    });
  }
}
