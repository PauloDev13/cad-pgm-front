import { AniversarianteModel } from '../models/aniversariente.model';

const CARGOS_ELEGIVEIS = [
  'procurador',
  'chefe de procuradoria especializada',
  'procurador geral',
  'procurador adjunto'
];

// Função que devolve o nome formatado com o prefixo 'Dra.' ou 'Dr.'
export function formatarNomeAniversariante(item: AniversarianteModel): string {
  // retorna o cargo em mínúsculo ou vazio
  const cargoLower = item.cargo.toLowerCase() ?? '';

  // se o array contiver um dos cargos, adiciona o prefixo e retorna.
  if (CARGOS_ELEGIVEIS.includes(cargoLower)) {
    const prefixo = item.genero.toLowerCase() === 'feminino' ? 'Dra. ' : 'Dr. ';
    return `${prefixo}${item.nome}`;
  }
  // se não, retorna o nome sem prefixo.
  return item.nome;
}
