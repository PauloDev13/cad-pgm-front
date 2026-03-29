// DTO do envio (request)
export interface CargoRequestDTO {
  nome: string;
  descricao?: string; // Para status_servidor
  email?: string; // Para alias_servidor
}

// DTO de Recebimento (Response)
export interface CargoResponseDTO {
  id: number;
  nome: string;
  descricao?: string; // Para status_servidor
  email?: string; // Para alias_servidor
}
