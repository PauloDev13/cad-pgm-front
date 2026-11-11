import { disabled, maxLength, minLength, required, schema, validate } from '@angular/forms/signals';
import {
  AberturaChamadoModel,
  AberturaChamadoRequestDTO,
  AtribuicaoChamadoRequestDTO,
  CancelarChamadoRequestDTO,
  ConcluirChamadoRequestDTO,
  IniciarAtendimentoRequestDTO
} from '../models/manutencao-chamado.model';
import {
  CategoriaDemandaModel,
  CategoriaDemandaRequestDTO,
  SubcategoriaModel,
  SubcategoriaRequestDTO,
  TipoServicoModel,
  TipoServicoRequestDTO
} from '../models/manutencao-catalogo.model';
import { signal } from '@angular/core';
import { PrioridadeChamado } from '../models/manutencao-enums.model';

// ==========================================
// ABERTURA DE CHAMADO
// ==========================================
export const initialAberturaChamado: AberturaChamadoModel = {
  andar: null,
  salaId: null,
  localDescricao: '',
  categoriaId: null,
  subcategoriaId: null,
  tipoServicoId: null,
  prioridade: PrioridadeChamado.MEDIA,
  prazoConclusao: null,
  movelRelacionado: '',
  numeroRequisicaoEcidade: '',
  descricao: ''
};

export const formAberturaChamado = signal(initialAberturaChamado);

export const aberturaChamadoSchema = schema<AberturaChamadoRequestDTO>((path) => {

  required(path.andar, { message: 'Selecione o ANDAR' });

  // Desabilita o autocomplete "Sala" se nenhum 'Andar' for selecionado
  disabled(path.salaId, ({ valueOf }) => !valueOf(path.andar));
  required(path.salaId, { message: 'Selecione a SALA' });
  // Validação condicional do local se sala for "Outro local" (salaId === 30)
  validate(path.localDescricao!, ({ value, valueOf }) => {
    const salaId = valueOf(path.salaId!);
    const local = value();
    if (salaId === 30 && (!local || local.trim().length === 0)) {
      return {
        kind: 'requiredLocalDescricao',
        message: 'A descrição do local é obrigatória quando "Outro local" for selecionado'
      };
    }
    return null;
  });

  // Desabilita o autocomplete "Grupo de demanda" se nenhuma 'Sala' for selecionado
  disabled(path.categoriaId, ({ valueOf }) =>
    !valueOf(path.salaId) || !valueOf(path.andar));
  required(path.categoriaId, { message: 'Selecione o Grupo de demanda' });

  // Desabilita o autocomplete "Categoria" se nenhum 'Grupo de Demanda' for selecionado
  disabled(path.subcategoriaId, ({ valueOf }) =>
    !valueOf(path.categoriaId) || !valueOf(path.andar));
  required(path.subcategoriaId, { message: 'Selecione a Categoria' });

  // Desabilita o autocomplete "Subcategoria" se nenhum 'Categoria' for selecionado
  disabled(path.tipoServicoId, ({ valueOf }) =>
    !valueOf(path.subcategoriaId) || !valueOf(path.andar));
  required(path.tipoServicoId, { message: 'Selecione a Subcategoria' });

  required(path.prioridade!, { message: 'Selecione a Prioridade' });

  // Validação de Prazo: Não retroativo à data de abertura
  validate(path.prazoConclusao!, ({ value }) => {

    const prazo = value();

    if (prazo) {
      // 1. Conversão Segura: Delega o parsing para o JS nativo
      const dataPrazo = new Date(prazo);

      // 2. Proteção contra entradas inválidas
      if (isNaN(dataPrazo.getTime())) {
        return {
          kind: 'dataInvalida',
          message: 'A data informada é inválida'
        };
      }

      // 3. Normalização: Zera horas, minutos, segundos e milissegundos
      // Isso garante que a data do prazo seja avaliada no início do dia local do usuário
      dataPrazo.setHours(0, 0, 0, 0);

      // 4. Hoje: Zera o relógio de hoje para comparar apenas os dias
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // 5. Comparação justa "Dia a Dia"
      if (dataPrazo < hoje) {
        return {
          kind: 'prazoRetroativo',
          message: 'O prazo de conclusão não pode ser anterior à data de hoje'
        };
      }
    }
    return null;
  });

  maxLength(path.movelRelacionado!, 100,
    { message: 'O número do tombo/patrimônio deve ter no máximo 100 caracteres' });
  maxLength(path.numeroRequisicaoEcidade!, 50,
    { message: 'O número da requisição no e-Cidade deve ter no máximo 50 caracteres' });

  required(path.descricao, { message: 'A descrição do problema é obrigatória' });
  minLength(path.descricao, 10, { message: 'Descreva a demanda com ao menos 10 caracteres' });
  maxLength(path.descricao, 2000, { message: 'A descrição não pode exceder 2000 caracteres' });

});

// ==========================================
// ATRIBUIÇÃO DE RESPONSÁVEL
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
// INÍCIO DO ATENDIMENTO
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
// CONCLUSÃO DE CHAMADO
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
// CANCELAMENTO DE CHAMADO
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
// CATEGORIA DE DEMANDA (ADMIN)
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
// SUBCATEGORIA DE DEMANDA (ADMIN)
// ==========================================
export const initialSubcategoria: SubcategoriaModel = {
  categoriaId: 0,
  nome: '',
  descricao: '',
  ordemExibicao: 1,
  prazoEstimadoDias: 2,
  requerTombamento: false,
  ativo: true
};

export const formSubcategoria = signal<SubcategoriaModel>(initialSubcategoria);

export const subcategoriaSchema = schema<SubcategoriaRequestDTO>((path) => {
  required(path.categoriaId, { message: 'A categoria vinculada é obrigatória' });

  validate(path.categoriaId, ({ value }) => {
    if (value() === 0 || value() === null || value() === undefined) {
      return { kind: 'idInvalid', message: 'A categoria vinculada é obrigatória' };
    }
    return null;
  });

  required(path.nome, { message: 'O nome da subcategoria é obrigatório' });
  minLength(path.nome, 3, { message: 'O nome deve ter no mínimo 3 caracteres' });
  maxLength(path.nome, 150, { message: 'O nome deve ter no máximo 150 caracteres' });
  maxLength(path.descricao!, 255, { message: 'A descrição deve ter no máximo 255 caracteres' });
});


// ==========================================
// TIPO DE SERVIÇO (ADMIN)
// ==========================================
export const initialTipoServico: TipoServicoModel = {
  subcategoriaId: 0,
  nome: '',
  descricao: '',
  ordemExibicao: 1,
  ativo: true
};

export const formTipoServico = signal<TipoServicoModel>(initialTipoServico);

export const tipoServicoSchema = schema<TipoServicoRequestDTO>((path) => {
  validate(path.subcategoriaId, ({ value }) => {
    if (value() === 0 || value() === null || value() === undefined) {
      return { kind: 'idInvalid', message: 'A categoria vinculada é obrigatória' };
    }
    return null;
  });

  required(path.nome, { message: 'O nome do tipo de serviço é obrigatório' });
  minLength(path.nome, 3, { message: 'O nome deve ter no mínimo 3 caracteres' });
  maxLength(path.nome, 150, { message: 'O nome deve ter no máximo 150 caracteres' });
  maxLength(path.descricao!, 255, { message: 'A descrição deve ter no máximo 255 caracteres' });
});
