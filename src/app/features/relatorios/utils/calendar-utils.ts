// Define a estrutura exata de como cada dia será representado na tela
export interface DiaPonto {
  dia: number;
  tipo: 'NORMAL' | 'SÁBADO' | 'DOMINGO' | 'FERIADO';
  nomeFeriado?: string;
}

export class CalendarUtils {

  // Método público que o componente vai chamar
  static gerarDiasDoMes(ano: number, mes: number): DiaPonto[] {
    // O dia '0' no Date do JS retorna o último dia do mês anterior,
    // revelando assim o total de dias do mês atual (28, 29, 30 ou 31)
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const feriados = this.calcularFeriadosNacionais(ano);
    const dias: DiaPonto[] = [];

    for (let dia = 1; dia <= diasNoMes; dia++) {
      // O JS conta os meses de 0 a 11, por isso 'mes - 1'
      const dataAtual = new Date(ano, mes - 1, dia);
      const diaDaSemana = dataAtual.getDay();

      // Padroniza a data para 'MM-DD' para comparar com a nossa lista
      const dataFormatada = `${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const feriado = feriados.find(f => f.data === dataFormatada);

      // A Hierarquia das regras:
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
    const feriadosFixos = [
      { data: '01-01', nome: 'FERIADO - Confraternização Universal' },
      { data: '04-21', nome: 'FERIADO - Tiradentes' },
      { data: '05-01', nome: 'FERIADO - Dia do Trabalhador' },
      { data: '06-05', nome: 'PONTO FACULTATIVO' },
      { data: '06-29', nome: 'PONTO FACULTATIVO - São Pedro' },
      { data: '09-07', nome: 'FERIADO - Independência' },
      { data: '10-03', nome: 'FERIADO ESTADUAL - Mártires de Cunhaú e Uruaçú' },
      { data: '10-12', nome: 'FERIADO - Nossa Senhora Aparecida' },
      { data: '10-28', nome: 'PONTO FACULTATIVO - Dia do Servidor Público' },
      { data: '11-02', nome: 'FERIADO - Finados' },
      { data: '11-15', nome: 'FERIADO - Proclamação da República' },
      { data: '11-20', nome: 'FERIADO - Dia da Consciência Negra' },
      { data: '12-25', nome: 'FERIADO - Natal' }
      // Insiram aqui feriados estaduais/municipais fixos (Ex: data: '10-03', nome: 'Mártires de Cunhaú')
    ];

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
      ...feriadosFixos,
      { data: format(sextaSanta), nome: 'FERIADO - Sexta-feira Santa' },
      { data: format(carnaval), nome: 'FERIADO - Carnaval' },
      { data: format(corpusChristi), nome: 'FERIADO - Corpus Christi' }
    ];
  }
}
