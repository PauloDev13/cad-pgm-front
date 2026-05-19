import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardResumoDTO } from '../../models/dashboard.model';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, BaseChartDirective, DatePipe, MatButtonModule, MatIconModule],
  providers: [provideCharts(withDefaultRegisterables())],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6 bg-slate-50 min-h-screen print:bg-white print:p-0">

      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Dashboard de RH</h1>
          <p class="text-slate-500 text-sm">Resumo estatístico do quadro de servidores</p>
        </div>

        <button
          mat-flat-button
          (click)="print()"
          class="!bg-blue-600 text-white print:!hidden transition-transform hover:scale-105
                w-full md:w-auto shrink-0">
          <mat-icon>print</mat-icon>
          Imprimir / PDF
        </button>
      </div>

      <div class="hidden print:block text-center mb-8">
        <h1 class="text-3xl font-bold">Relatório de Gestão de Pessoas</h1>
        <p class="text-slate-600">Dados consolidados em {{ Date.now() | date:'dd/MM/yyyy' }}</p>
      </div>

      @if (isLoading()) {
      } @else if (summary()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <mat-card
            class="col-span-1 md:col-span-3 p-6 border-l-4 border-l-blue-600 shadow-sm
                  print:shadow-none print:border-slate-200">
            <div class="text-slate-500 font-medium uppercase text-xs tracking-wider">
              Total de Servidores
            </div>
            <div class="text-4xl font-black text-blue-700 mt-1">
              {{ summary()?.totalServidores }}
            </div>
          </mat-card>

          <mat-card
            class="p-6 h-[450px] shadow-sm print:shadow-none print:border print:border-slate-100">
            <h2 class="text-sm font-bold text-slate-700 uppercase mb-6 flex items-center gap-2">
              <div class="w-2 h-4 bg-blue-500 rounded-full"></div>
              Distribuição por Vínculo
            </h2>
            <div class="relative h-[350px] w-full">
              <canvas baseChart
                      [data]="graphVinculoData()"
                      [options]="optionsGraph"
                      type="doughnut">
              </canvas>
            </div>
          </mat-card>

          <mat-card
            class="col-span-1 md:col-span-2 p-6 h-[450px] shadow-sm print:shadow-none
                  print:border print:border-slate-100">
            <h2 class="text-sm font-bold text-slate-700 uppercase mb-6 flex items-center gap-2">
              <div class="w-2 h-4 bg-indigo-500 rounded-full"></div>
              Quadro por Status Atual
            </h2>
            <div class="relative h-[320px] w-full">
              <canvas baseChart
                      [data]="graphStatusData()"
                      [options]="optionsGraph"
                      type="bar">
              </canvas>
            </div>
          </mat-card>

        </div>

        <div class="hidden print:block mt-10 text-right text-xs text-slate-400">
          Documento gerado eletronicamente pelo Sistema de RH.
        </div>
      }
    </div>
  `
})
export default class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  private readonly colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#f43f5e', '#14b8a6', '#6366f1', '#ec4899'
  ];

  isLoading = signal<boolean>(true);
  summary = signal<DashboardResumoDTO | null>(null);

  // Configurações e Dados dos Gráficos (Serão preenchidos após o carregamento)
  graphVinculoData = signal<ChartData<'doughnut'>>(
    { labels: [], datasets: [{ data: [] }] });
  graphStatusData = signal<ChartData<'bar'>>(
    { labels: [], datasets: [{ data: [] }] });

  // Opções visuais globais (Pode customizar como quiser)
  optionsGraph: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        align: 'start'
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    }
  };

  ngOnInit(): void {
    this.loadData();
  }

  print() {
    window.print();
  }

  // Carrega os gráficos
  private loadData() {
    this.dashboardService.getResumoServidores().subscribe({
      next: (dados) => {
        this.summary.set(dados);

        setTimeout(() => {
          this.createGraph(dados);
        }, 100);

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard', err);
        this.isLoading.set(false);
      }
    });
  }

  // Desenha os gráficos
  private createGraph(dados: DashboardResumoDTO) {
    this.graphVinculoData.set({
      // Gráfico de Rosca (Doughnut) para Vínculo
      labels: dados.distributionByVinculo.map(i => `${i.label}: ${i.quantity}`),
      datasets: [{
        data: dados.distributionByVinculo.map(i => i.quantity),
        backgroundColor: this.colors,
        hoverOffset: 10
      }]
    });

    this.graphStatusData.set({
      labels: dados.distributionByStatus.map(i => i.label),
      datasets: [{
        label: 'Quantidade:',
        data: dados.distributionByStatus.map(i => i.quantity),
        backgroundColor: this.colors.slice(0, dados.distributionByStatus.length),
        borderColor: this.colors.slice(0, dados.distributionByStatus.length),
        borderWidth: 1,
        borderRadius: 8
      }]
    });
  }

  protected readonly Date = Date;
}
