export interface DashboardItemDTO {
  label: string;
  quantity: number;
}

export interface DashboardResumoDTO {
  totalServidores: number;
  distributionByVinculo: DashboardItemDTO[];
  distributionByStatus: DashboardItemDTO[];
}
