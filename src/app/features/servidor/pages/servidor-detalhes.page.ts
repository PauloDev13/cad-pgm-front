import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ServidorResponseDTO } from '../models/servidor.model';
import { ServidorService } from '../services/servidor.service';
import { ToastService } from '../../../shared/service/toast.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../../shared/components/loading.component/loading.component';

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
  ],
  standalone: true,
  template: `
    <div
      class="max-w-5xl mx-auto mt-4 p-4 md:p-6 bg-gray-50 shadow rounded-2xl border border-gray-200"
    >
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-3">
          <button
            mat-icon-button
            (click)="voltar()"
            matTooltip="Voltar"
            class="!bg-white border border-gray-300 drop-shadow-sm transition-transform hover:scale-105"
          >
            <mat-icon class="text-gray-600">arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 leading-tight">Detalhes do Servidor</h1>
            <p class="text-sm text-gray-500">Visualização completa dos dados</p>
          </div>
        </div>
      </div>

      <app-loading [isLoading]="isLoading()" />

      @if (!isLoading() && servidor(); as s) {
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
              <mat-icon>person</mat-icon>
              Dados Pessoais
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Nome Completo</span
                >
                <span class="text-base text-gray-800 font-medium">{{ s.nome }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >CPF</span
                >
                <span class="text-base text-gray-800 font-medium"
                  >{{ s.cpf | slice: 0 : 3 }} .***.***-{{ s.cpf | slice: 9 : 11 }}</span
                >
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Data de Nascimento</span
                >
                <span class="text-base text-gray-800 font-medium">{{
                  s.dataNascimento || 'Não informada'
                }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Gênero</span
                >
                <span class="text-base text-gray-800 font-medium">{{
                  s.genero || 'Não informado'
                }}</span>
              </div>
              <div class="flex flex-col md:col-span-2">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Filiação</span
                >
                <span class="text-base text-gray-800 font-medium">{{
                  s.filiacao || 'Não informada'
                }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >E-mail Pessoal</span
                >
                <span class="text-base text-gray-800 font-medium">{{ s.emailPessoal }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Telefone</span
                >
                <span class="text-base text-gray-800 font-medium">{{
                  s.telefone || 'Não informado'
                }}</span>
              </div>
              <div class="flex flex-col md:col-span-4">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Endereço</span
                >
                <span class="text-base text-gray-800 font-medium">{{
                  s.endereco || 'Não informado'
                }}</span>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="p-6 bg-gray-50/50">
            <h2 class="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
              <mat-icon>work</mat-icon>
              Vínculo Funcional
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Matrícula</span
                >
                <span class="text-base text-gray-800 font-medium">{{ s.matricula }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Status</span
                >
                <span class="inline-flex items-center mt-1">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-bold"
                    [ngClass]="
                      s.status?.descricao === 'ATIVO'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    "
                  >
                    {{ s.status?.descricao || 'INDEFINIDO' }}
                  </span>
                </span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Vínculo</span
                >
                <span class="text-base text-gray-800 font-medium">{{
                  s.vinculo?.nome || '-'
                }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Cargo</span
                >
                <span class="text-base text-gray-800 font-medium">{{ s.cargo?.nome || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Setor</span
                >
                <span class="text-base text-gray-800 font-medium">{{ s.setor?.nome || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >Lotação</span
                >
                <span class="text-base text-gray-800 font-medium">{{
                  s.lotacao?.nome || '-'
                }}</span>
              </div>
              <div class="flex flex-col md:col-span-2">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >E-mail Institucional</span
                >
                <span class="text-base text-gray-800 font-medium">{{
                  s.emailInstitucional || 'Não informado'
                }}</span>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="p-6">
            <h2 class="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
              <mat-icon>security</mat-icon>
              Permissões e Acessos
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                  >Sistemas</span
                >
                <div class="flex flex-wrap gap-2">
                  @for (sistema of s.sistemas; track sistema.id) {
                    <span
                      class="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-medium"
                    >
                      {{ sistema.nome }}
                    </span>
                  } @empty {
                    <span class="text-sm text-gray-500 italic">Nenhum sistema vinculado</span>
                  }
                </div>
              </div>

              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                  >Aliases de E-mail</span
                >
                <div class="flex flex-wrap gap-2">
                  @for (alias of s.aliases; track alias.id) {
                    <span
                      class="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-medium"
                    >
                      {{ alias.email }}
                    </span>
                  } @empty {
                    <span class="text-sm text-gray-500 italic">Nenhum alias vinculado</span>
                  }
                </div>
              </div>

              <div class="flex flex-col">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                  >Procuradores Vinculados</span
                >
                <div class="flex flex-wrap gap-2">
                  @for (proc of s.procuradores; track proc.id) {
                    <span
                      class="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-medium"
                    >
                      {{ proc.nome }}
                    </span>
                  } @empty {
                    <span class="text-sm text-gray-500 italic">Nenhum procurador vinculado</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export default class ServidorDetalhesPage {
  // O Angular injeta o :id da URL direto aqui!
  id = input.required<string>();
  // Estado
  servidor = signal<ServidorResponseDTO | null>(null);
  isLoading = signal<boolean>(true);
  // Injeções
  private readonly servidorService = inject(ServidorService);
  private readonly toastService = inject(ToastService);
  private readonly location = inject(Location); // Para o botão voltar

  constructor() {
    effect(() => {
      const currentId = this.id;
      if (currentId()) {
        this.carregarServidor();
      }
    });
  }

  // ngOnInit(): void {
  //   this.carregarServidor();
  // }

  voltar() {
    this.location.back(); // Retorna para a página anterior (a tabela) no histórico do navegador
  }

  private carregarServidor() {
    this.isLoading.set(true);

    // Converte o id (string da URL) para número
    const servidorId = Number(this.id());

    this.servidorService.findById(servidorId).subscribe({
      next: (dados) => {
        this.servidor.set(dados);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao buscar detalhes do servidor.');
        this.isLoading.set(false);
        this.voltar(); // Volta para a tabela se o ID não existir
      },
    });
  }
}
