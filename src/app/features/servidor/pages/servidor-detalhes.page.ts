import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ServidorResponseDTO } from '../models/servidor.model';
import { ServidorService } from '../services/servidor.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../../shared/components/loading.component/loading.component';
import { DataDisplayComponent } from '../component/data-display.component';
import { DataInfoComponent } from '../component/data-info.component';
import { MatriculaPipe } from '../../../shared/pipes/matricula.pipe';
import { TelefonePipe } from '../../../shared/pipes/telefone.pipe';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-servidor-detalhes',
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    LoadingComponent,
    DataDisplayComponent,
    DataInfoComponent,
    TelefonePipe,
    MatriculaPipe
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="max-w-7xl mx-auto mt-4 print:t-0 p-4 md:p-4 print:p-0
            bg-gray-50 print:bg-white shadow print:shadow-none rounded-2xl
            print:rounded-none border border-gray-200 print:border-none"
    >
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-3">
          <button
            mat-icon-button
            (click)="goBack()"
            matTooltip="Voltar"
            class="print:!hidden !bg-blue-600 border border-gray-300 drop-shadow-sm
                   transition-transform duration-500 hover:scale-105"
          >
            <mat-icon class="!text-white">arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 leading-tight">Detalhes do Servidor</h1>
            <p class="text-sm text-gray-600">Visualização completa dos dados</p>
          </div>
        </div>
        <button
          mat-flat-button
          (click)="imprimir()"
          class="!bg-blue-600 text-white print:!hidden transition-transform hover:scale-105"
        >
          <mat-icon>print</mat-icon>
          Imprimir / PDF
        </button>
      </div>

      <!-- Sessão Dados Pessoais-->
      <mat-divider class="print:!my-2"></mat-divider>

      <app-loading [isLoading]="isLoading()" />

      @if (!isLoading() && servidor(); as s) {
        <div
          class="bg-gray-50 print:bg-white rounded-xl border print:border-none border-gray-200
                shadow-sm print:shadow-none overflow-hidden print:overflow-visible"
        >
          <div class="p-4 print:p-0 print:break-inside-avoid">
            <h2 class="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
              <mat-icon>person</mat-icon>
              Dados Pessoais
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <!-- Campo Nome-->
              <app-data-display class="col-span-2 mb-6" label="Nome" [fieldData]="s.nome" />

              <!-- Campo CPF-->
              <app-data-display
                label="CFP"
                [fieldData]="(s.cpf | slice: 0 : 3) + '.***.***-' + (s.cpf | slice: 9 : 11)"
              />

              <!-- Campo Data de Nascimento-->
              <app-data-display
                label="Data de Nascimento"
                [fieldData]="s.dataNascimento | date: 'dd/MM/yyyy'"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <!-- Campo E-mail Pessoal-->
              <app-data-display
                class="col-span-2"
                label="E-mail Pessoal"
                [fieldData]="s.emailPessoal"
              />
              <!-- Campos Gênero, Telefone, Filiação e Endereço-->
              <app-data-display label="Gênero" [fieldData]="s.genero" />
              <app-data-display
                label="Telefone"
                [fieldData]="s.telefone | telefone"
              />
              <app-data-display class="md:col-span-2" label="Filiação" [fieldData]="s.filiacao" />
              <app-data-display class="md:col-span-2" label="Endereço" [fieldData]="s.endereco" />
            </div>
          </div>

          <!-- Sessão Vínculo Funcional-->
          <mat-divider class="print:!my-2"></mat-divider>

          <div class="p-4 bg-gray-50/50 print:bg-transparent print:p-0 print:break-inside-avoid">
            <h2 class="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
              <mat-icon>work</mat-icon>
              Vínculo Funcional
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <!-- Campo Matrícula-->
              <app-data-display label="Matrícula" [fieldData]="s.matricula | matricula" />

              <!-- Campo Status-->
              <div class="flex flex-col">
                <span class="text-xs font-bold text-gray-600 uppercase tracking-wider">Status</span>
                <span class="inline-flex items-center mt-1">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-bold"
                    [ngClass]="cssStatus(s.status?.descricao)"
                  >
                    {{ s.status?.descricao || 'INDEFINIDO' }}
                  </span>
                </span>
              </div>

              <!-- Campos Vínculo, Cargo, Setor, Lotação e E-mail Institucional-->
              <app-data-display label="Vínculo" [fieldData]="s.vinculo?.nome" />
              <app-data-display label="Cargo" [fieldData]="s.cargo?.nome" />
              <app-data-display label="Setor" [fieldData]="s.setor?.nome" />
              <app-data-display label="Lotação" [fieldData]="s.lotacao?.nome" />
              <app-data-display
                class="md:col-span-2"
                label="E-mail Institucional"
                [fieldData]="s.emailInstitucional"
              />
            </div>
          </div>

          <!-- Sessão Permissões e Acessos-->
          <mat-divider class="print:!my-2"></mat-divider>

          <div class="p-4 print:p-0 print:break-inside-avoid">
            <h2 class="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
              <mat-icon>security</mat-icon>
              Permissões e Acessos
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Campo Sistemas Acessados-->
              <app-data-info
                spanClass="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200
                          rounded-md text-xs font-medium"
                label="Acessa os Sistemas"
                [data]="s.sistemas"
                emptyMessage="Sistema"
              />

              <!-- Campo com lista de aliasses-->
              <app-data-info
                spanClass="px-2 py-1 bg-purple-50 text-purple-700 border
                          border-purple-200 rounded-md text-xs font-medium"
                label="Aliasses de E-mail"
                [data]="s.aliases"
                emptyMessage="Alias"
              />

              <!-- Campo Procuradores Vinculados-->
              <app-data-info
                spanClass="px-2 py-1 bg-amber-50 text-amber-700 border
                          border-amber-200 rounded-md text-xs font-medium"
                label="Procuradores Vinculados"
                [data]="s.procuradores"
                emptyMessage="Procurador"
              />
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export default class ServidorDetalhesPage {
  // Injeções
  private readonly servidorService = inject(ServidorService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly location = inject(Location); // Para o botão voltar

  // O Angular injeta o :id da URL direto aqui!
  id = input.required<string>();
  // Estado
  servidor = signal<ServidorResponseDTO | null>(null);
  isLoading = signal<boolean>(true);


  constructor() {
    effect(() => {
      const currentId = this.id;
      if (currentId()) {
        this.loadServidorList();
      }
    });
  }

  goBack() {
    this.location.back(); // Retorna para a página anterior (a tabela) no histórico do navegador
  }

  imprimir() {
    window.print();
  }

  protected cssStatus(descricao: string | undefined): string {
    if (!descricao) {
      return 'bg-gray-700 text-white';
    }

    // Remove acentos e converte para minúsculo
    // Exemplo: Transforma "Férias" ou "férias" em "ferias"
    const statusNormalizado = descricao
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const mapColors: Record<string, string> = {
      ativo: 'bg-green-700 text-white',
      afastado: 'bg-yellow-300 text-black',
      ferias: 'bg-blue-700 text-white',
      pendente: 'bg-red-700 text-white'
    };
    return mapColors[statusNormalizado] || 'bg-gray-700 text-white';
  }

  private loadServidorList() {
    this.isLoading.set(true);

    let servidorName = '';
    // Converte o id (string da URL) para número
    const servidorId = Number(this.id());

    this.servidorService.findById(servidorId)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (dados) => {
          this.servidor.set(dados);
          this.isLoading.set(false);
          servidorName = dados.nome;
        },
        error: (err) => {
          this.errorHandlerService.handle(err, 'Buscar');
          // this.notificationService.error(
          //   `Erro ao buscar detalhes do servidor ${servidorName}.`,
          //   'Detalhe'
          // );
          // this.isLoading.set(false);
          servidorName = '';
          this.goBack(); // Volta para a tabela se o ID não existir
        }
      });
  }
}
