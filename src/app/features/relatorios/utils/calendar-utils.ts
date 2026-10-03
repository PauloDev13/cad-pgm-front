// Define a estrutura exata de como cada dia será representado na tela
export interface DiaPonto {
  dia: number;
  tipo: 'NORMAL' | 'SÁBADO' | 'DOMINGO' | 'FERIADO';
  nomeFeriado?: string;
}

export interface FeriadoInfo {
  data: string; // Formato 'MM-dd'
  nome: string;
}

export class CalendarUtils {
  /**
   * Gera a lista de dias do mês mesclando os feriados cadastrados no banco
   * com os feriados móveis calculados matematicamente para o ano específico.
   */
  static gerarDiasDoMes(
    ano: number,
    mes: number,
    feriadosCadastrados: FeriadoInfo[] = []
  ): DiaPonto[] {
    const diasNoMes = new Date(ano, mes, 0).getDate();

    // Calcula os feriados móveis daquele ano específico (Carnaval, Sexta-feira Santa, Corpus Christi)
    const feriadosMoveis = this.calcularFeriadosNacionais(ano);

    // Mescla os feriados:
    // Se o feriado móvel já estiver cadastrado no banco, o cadastro do banco prevalece (para respeitar o checkbox ativo)
    const todosFeriados: FeriadoInfo[] = [...feriadosCadastrados];

    for (const movel of feriadosMoveis) {
      const jaExisteNoBanco = todosFeriados.some(f => f.data === movel.data);

      if (!jaExisteNoBanco) {
        todosFeriados.push(movel);
      }
    }

    const dias: DiaPonto[] = [];

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataAtual = new Date(ano, mes - 1, dia);
      const diaDaSemana = dataAtual.getDay();

      // Padroniza a data para 'MM-DD'
      const dataFormatada = `${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const feriado = todosFeriados.find(f => f.data === dataFormatada);

      if (feriado) {
        dias.push({ dia, tipo: 'FERIADO', nomeFeriado: feriado.nome });
      } else if (diaDaSemana === 0) {
        dias.push({ dia, tipo: 'DOMINGO' });
      } else if (diaDaSemana === 6) {
        dias.push({ dia, tipo: 'SÁBADO' });
      } else {
        dias.push({ dia, tipo: 'NORMAL' });
      }
    }
    return dias;
  }

  // Método privado com o motor matemático
  private static calcularFeriadosNacionais(ano: number) {
    // Algoritmo matemático para o cálculo da Páscoa
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mesPascoa = Math.floor((h + l - 7 * m + 114) / 31);
    const diaPascoa = ((h + l - 7 * m + 114) % 31) + 1;

    const pascoa = new Date(ano, mesPascoa - 1, diaPascoa);

    const sextaSanta = new Date(pascoa);
    sextaSanta.setDate(pascoa.getDate() - 2);

    const carnaval = new Date(pascoa);
    carnaval.setDate(pascoa.getDate() - 47);

    const corpusChristi = new Date(pascoa);
    corpusChristi.setDate(pascoa.getDate() + 60);

    const format = (d: Date) => `${String(d.getMonth() + 1)
      .padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return [
      // ...feriadosFixos,
      { data: format(sextaSanta), nome: 'FERIADO - Sexta-feira Santa' },
      { data: format(carnaval), nome: 'FERIADO - Carnaval' },
      { data: format(corpusChristi), nome: 'FERIADO - Corpus Christi' }
    ];
  }
}
