import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { LoadingComponent } from '../../../../shared/components/loading.component/loading.component';
import { DashboardManutencaoResponseDTO } from '../../models/manutencao-dashboard.model';
import { ManutencaoDashboardService } from '../../services/manutencao-dashboard.service';

@Component({
  selector: 'app-manutencao-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
    LoadingComponent,
    LoadingComponent,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="p-4 md:p-6 bg-slate-50 min-h-screen print:bg-white print:p-0">
      <!-- Cabeçalho -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden"
      >
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Indicadores de Manutenção Predial</h1>
          <p class="text-slate-500 text-sm">
            Métricas de atendimento, volume de ordens de serviço e SLA
          </p>
        </div>

        <button
          mat-flat-button
          (click)="imprimir()"
          class="!bg-blue-600 !text-white hover:scale-105 transition-transform w-full md:w-auto"
        >
          <mat-icon>print</mat-icon>
          Imprimir Relatório
        </button>
      </div>

      @if (isLoading()) {
        <div class="py-12 flex justify-center items-center">
          <app-loading [isLoading]="true" />
        </div>
      }
      @if (dados(); as d) {
        <!-- Cards KPI -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <mat-card class="p-4 border-l-4 border-l-amber-500 shadow-sm">
            <span class="text-xs uppercase font-medium text-slate-500">Total Abertos</span>
            <span class="text-3xl font-black text-amber-600 mt-1">{{ d.totalAbertos }}</span>
          </mat-card>

          <mat-card class="p-4 border-l-4 border-l-emerald-500 shadow-sm">
            <span class="text-xs uppercase font-medium text-slate-500">Concluídos</span>
            <span class="text-3xl font-black text-emerald-600 mt-1">{{ d.totalConcluidos }}</span>
          </mat-card>

          <mat-card class="p-4 border-l-4 border-l-rose-500 shadow-sm">
            <span class="text-xs uppercase font-medium text-slate-500">Cancelados</span>
            <span class="text-3xl font-black text-rose-600 mt-1">{{ d.totalCancelados }}</span>
          </mat-card>

          <mat-card class="p-4 border-l-4 border-l-blue-500 shadow-sm">
            <span class="text-xs uppercase font-medium text-slate-500">Tempo Médio Resposta</span>
            <span class="text-2xl font-black text-blue-700 mt-1">
              {{
                d.tempoMedioRespostaHoras
                  ? (d.tempoMedioRespostaHoras | number: '1.1-1') + 'h'
                  : 'N/D'
              }}
            </span>
          </mat-card>

          <mat-card class="p-4 border-l-4 border-l-indigo-500 shadow-sm">
            <span class="text-xs uppercase font-medium text-slate-500">Tempo Médio Resolução</span>
            <span class="text-2xl font-black text-indigo-700 mt-1">
              {{
                d.tempoMedioResolucaoHoras
                  ? (d.tempoMedioResolucaoHoras | number: '1.1-1') + 'h'
                  : 'N/D'
              }}
            </span>
          </mat-card>
        </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Gráfico 1: Volume por Estado -->
          <mat-card class="p-6 shadow-sm">
            <h2 class="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
              <div class="w-2 h-4 bg-blue-600 rounded-full"></div>
              Distribuição por Status
            </h2>
            <div class="relative h-[300px] w-full">
              <canvas
                baseChart
                [data]="graficoEstadoData()"
                [options]="chartOptions"
                type="doughnut"
              ></canvas>
            </div>
          </mat-card>

          <!-- Gráfico 2: Volume por Categoria -->
          <mat-card class="p-6 shadow-sm">
            <h2 class="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
              <div class="w-2 h-4 bg-indigo-600 rounded-full"></div>
              Demandas por Categoria
            </h2>
            <div class="relative h-[300px] w-full">
              <canvas
                baseChart
                [data]="graficoCategoriaData()"
                [options]="chartOptions"
                type="bar"
              ></canvas>
            </div>
          </mat-card>
        </div>
      }
    </div>
  `,
})
export default class ManutencaoDashboardPage implements OnInit {
  private readonly dashboardService = inject(ManutencaoDashboardService);

  readonly isLoading = signal<boolean>(false);
  readonly dados = signal<DashboardManutencaoResponseDTO | null>(null);

  readonly chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  readonly graficoEstadoData = computed<ChartData<'doughnut'>>(() => {
    const d = this.dados();
    if (!d) return { labels: [], datasets: [] };

    return {
      labels: d.volumePorEstado.map((i) => i.chave),
      datasets: [
        {
          data: d.volumePorEstado.map((i) => i.quantidade),
          backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e'],
        },
      ],
    };
  });

  readonly graficoCategoriaData = computed<ChartData<'bar'>>(() => {
    const d = this.dados();
    if (!d) return { labels: [], datasets: [] };

    return {
      labels: d.volumePorCategoria.map((i) => i.chave),
      datasets: [
        {
          label: 'Chamados',
          data: d.volumePorCategoria.map((i) => i.quantidade),
          backgroundColor: '#2563eb',
        },
      ],
    };
  });

  ngOnInit() {
    this.carregarDashboard();
  }

  carregarDashboard() {
    this.isLoading.set(true);
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.dados.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  imprimir() {
    window.print();
  }
}
