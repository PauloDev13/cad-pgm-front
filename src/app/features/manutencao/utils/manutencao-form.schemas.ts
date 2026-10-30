import { maxLength, minLength, required, schema, validate } from '@angular/forms/signals';
import { AndarCodigo } from '../models/manutencao-enums.model';
import {
  AberturaChamadoRequestDTO,
  AtribuicaoChamadoRequestDTO,
  CancelarChamadoRequestDTO,
  ConcluirChamadoRequestDTO,
  IniciarAtendimentoRequestDTO
} from '../models/manutencao-chamado.model';
import {
  CategoriaDemandaModel,
  CategoriaDemandaRequestDTO,
  TipoServicoModel,
  TipoServicoRequestDTO
} from '../models/manutencao-catalogo.model';
import { signal } from '@angular/core';

// ==========================================
// 1. ABERTURA DE CHAMADO
// ==========================================
export const initialAberturaChamado: AberturaChamadoRequestDTO = {
  andar: AndarCodigo.TERREO,
  salaId: null,
  localDescricao: '',
  categoriaId: 0,
  tipoServicoId: 0,
  descricao: ''
};

export const formAberturaChamado = signal(initialAberturaChamado);

export const aberturaChamadoSchema = schema<AberturaChamadoRequestDTO>((path) => {
  required(path.andar, { message: 'O andar é obrigatório' });
  required(path.categoriaId, { message: 'A categoria do serviço é obrigatória' });
  required(path.tipoServicoId, { message: 'O tipo de serviço é obrigatório' });

  required(path.descricao, { message: 'A descrição do problema é obrigatória' });
  minLength(path.descricao, 10, { message: 'Descreva a demanda com ao menos 10 caracteres' });
  maxLength(path.descricao, 2000, { message: 'A descrição não pode exceder 2000 caracteres' });

  // Validação condicional: Se sala for "Outro" (salaId === null), a descrição do local torna-se obrigatória
  validate(path.localDescricao!, ({ value, valueOf }) => {
    const salaId = valueOf(path.salaId!);
    const local = value();

    if ((salaId === null || salaId === undefined) && (!local || local.trim().length === 0)) {
      return {
        kind: 'requiredLocalDescricao',
        message: 'A descrição do local é obrigatória quando não houver uma sala selecionada'
      };
    }
    return null;
  });
});

// ==========================================
// 2. ATRIBUIÇÃO DE RESPONSÁVEL
// ==========================================
export const initialAtribuicaoChamado: AtribuicaoChamadoRequestDTO = {
  responsavelId: 0,
  observacao: ''
};

export const formAtribuicaoModel = signal<AtribuicaoChamadoRequestDTO>({
  ...initialAtribuicaoChamado
});


export const atribuicaoChamadoSchema = schema<AtribuicaoChamadoRequestDTO>((path) => {
  required(path.responsavelId, { message: 'Selecione um técnico/responsável' });
  maxLength(path.observacao!, 1000, { message: 'A observação deve ter no máximo 1000 caracteres' });
});

// ==========================================
// 3. INÍCIO DO ATENDIMENTO
// ==========================================
export const initialIniciarAtendimento: IniciarAtendimentoRequestDTO = {
  observacao: ''
};

export const formIniciarModel =
  signal<IniciarAtendimentoRequestDTO>(initialIniciarAtendimento);

export const iniciarAtendimentoSchema = schema<IniciarAtendimentoRequestDTO>((path) => {
  maxLength(path.observacao, 1000, { message: 'A observação deve ter no máximo 1000 caracteres' });
});

// ==========================================
// 4. CONCLUSÃO DE CHAMADO
// ==========================================
export const initialConcluirChamado: ConcluirChamadoRequestDTO = {
  observacao: ''
};

export const formConcluirModel =
  signal<ConcluirChamadoRequestDTO>(initialConcluirChamado);

export const concluirChamadoSchema = schema<ConcluirChamadoRequestDTO>((path) => {
  maxLength(path.observacao!, 1000, { message: 'A observação deve ter no máximo 1000 caracteres' });
});

// ==========================================
// 5. CANCELAMENTO DE CHAMADO
// ==========================================
export const initialCancelarChamado: CancelarChamadoRequestDTO = {
  motivo: ''
};

export const formCancelarModel =
  signal<CancelarChamadoRequestDTO>(initialCancelarChamado);

export const cancelarChamadoSchema = schema<CancelarChamadoRequestDTO>((path) => {
  required(path.motivo, { message: 'O motivo do cancelamento é obrigatório' });
  minLength(path.motivo, 5, { message: 'O motivo deve conter no mínimo 5 caracteres' });
  maxLength(path.motivo, 500, { message: 'O motivo deve ter no máximo 500 caracteres' });
});

// ==========================================
// 6. CATEGORIA DE DEMANDA (ADMIN)
// ==========================================
export const initialCategoriaDemanda: CategoriaDemandaModel = {
  nome: '',
  descricao: '',
  ordemExibicao: 1,
  ativo: true
};

export const formCategoriaDemanda = signal<CategoriaDemandaModel>(
  initialCategoriaDemanda
);

export const categoriaDemandaSchema = schema<CategoriaDemandaRequestDTO>((path) => {
  required(path.nome, { message: 'O nome da categoria é obrigatório' });
  maxLength(path.nome, 100, { message: 'O nome deve ter no máximo 100 caracteres' });
  minLength(path.nome, 3, { message: 'O nome deve ter no mínimo 3 caracteres' });
  maxLength(path.descricao!, 255, { message: 'A descrição deve ter no máximo 255 caracteres' });
});

// ==========================================
// 7. TIPO DE SERVIÇO (ADMIN)
// ==========================================
export const initialTipoServico: TipoServicoModel = {
  categoriaId: 0,
  nome: '',
  descricao: '',
  ordemExibicao: 1,
  ativo: true
};

export const formTipoServico = signal<TipoServicoModel>(initialTipoServico);

export const tipoServicoSchema = schema<TipoServicoRequestDTO>((path) => {
  validate(path.categoriaId, ({ value }) => {
    if (value() === 0) {
      return { kind: 'idInvalid', message: 'A categoria vinculada é obrigatória' };
    }
    return null;
  });
  required(path.nome, { message: 'O nome do tipo de serviço é obrigatório' });
  minLength(path.nome, 3, { message: 'O nome deve ter no mínimo 3 caracteres' });
  maxLength(path.nome, 150, { message: 'O nome deve ter no máximo 150 caracteres' });
  maxLength(path.descricao!, 255, { message: 'A descrição deve ter no máximo 255 caracteres' });
});
