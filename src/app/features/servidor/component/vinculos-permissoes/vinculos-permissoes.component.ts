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
import { CheckboxGridComponent } from './card.component/checkbox-grid.component';

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
    CheckboxGridComponent
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

            <app-checkbox-grid
              [items]="servidoresStore.sistemas()"
              [selectedIds]="selectedSistemas"
              (toggle)="toggleSelection('sistemas', $event.id, $event.checked)"
            />
          </div>

          <mat-divider></mat-divider>

          <div class="flex flex-col gap-3">
            <div>
              <h3 class="text-lg font-bold text-blue-800 m-0">Procuradores Vinculados</h3>
              <p class="text-sm text-gray-500 m-0">Selecione as autoridades representadas.</p>
            </div>

            <app-checkbox-grid
              [items]="servidoresStore.procuradores()"
              [selectedIds]="selectedProcuradores"
              (toggle)="toggleSelection('procuradores', $event.id, $event.checked)"
            />
          </div>

          <mat-divider></mat-divider>

          <div class="flex flex-col gap-3">
            <div>
              <h3 class="text-lg font-bold text-blue-800 m-0">E-mails (Alias) Vinculados</h3>
              <p class="text-sm text-gray-500 m-0">Selecione os e-mails e aliases de uso institucional.</p>
            </div>

            <app-checkbox-grid
              [items]="servidoresStore.aliases()"
              [selectedIds]="selectedAliases"
              (toggle)="toggleSelection('aliases', $event.id, $event.checked)"
            />
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
    // let targetArray: number[];

    if (listName === 'sistemas') {
      this.selectedSistemas = isChecked
        ? [...this.selectedSistemas, id]
        : this.selectedSistemas.filter(i => i !== id);

    } else if (listName === 'procuradores') {
      this.selectedProcuradores = isChecked
        ? [...this.selectedProcuradores, id]
        : this.selectedProcuradores.filter(i => i !== id);
    } else {
      this.selectedAliases = isChecked
        ? [...this.selectedAliases, id]
        : this.selectedAliases.filter(i => i !== id);
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
