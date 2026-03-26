export class CustomValidators {
  // Validador de Idade Mínima
  static minimunAge(value: any, minAge: number): { kind: string; message: string } | null {
    if (!value) return null; // Deixa o erro de "campo vazio" para o Validators.required
    const birthDate = new Date(value);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const month = currentDate.getMonth() - birthDate.getMonth();

    // Se o mês atual for menor que o mês de nascimento, ou se for o mesmo
    // mês, mas o dia atual for menor, ainda não fez aniversário no ano
    if (month < 0 || (month === 0 && currentDate.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < minAge) {
      return {
        kind: 'minimumAge',
        message: `Idade mínima: ${minAge} anos. A informada: ${age} anos. `,
      };
    }

    return null; // Válido!
  }

  // Verifica se a data é real no calendário
  // static dataValida(value: any): { kind: string; message: string } | null {
  //   // O Pulo do Gato: O valor chegou nulo, MAS o alarme disparou no Adapter?
  //   // Então sabemos que não está vazio, o usuário digitou lixo!
  //
  //   // Se está vazio e o alarme NÃO tocou, é porque está vazio mesmo. Deixa pro Required.
  //
  //   if (!value && DateValidationState.isInvalid) {
  //     return { kind: 'dataInvalida', message: 'A data informada é inválida 1' };
  //   }
  //
  //   if (!value) return null;
  //   // Se chegou a instância do erro diretamente
  //   if (value instanceof Date && isNaN(value.getTime())) {
  //     return { kind: 'dataInvalida', message: 'A data informada é inválida 2' };
  //   }
  //
  //   // Se o Angular Material já converteu para Date e percebeu que é inválido (Invalid Date)
  //   if (value instanceof Date && isNaN(value.getTime())) {
  //     return { kind: 'dataInvalida', message: 'Data inválida 1' };
  //   }
  //
  //   // Se o valor for a string digitada "DD/MM/YYYY"
  //   if (typeof value === 'string') {
  //     const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  //     const match = value.match(regex);
  //
  //     if (!match) {
  //       return { kind: 'dataInvalida', message: 'Formato inválido. Use DD/MM/AAAA.' };
  //     }
  //
  //     const dia = parseInt(match[1], 10);
  //     const mes = parseInt(match[2], 10);
  //     const ano = parseInt(match[3], 10);
  //
  //     // O JS começa o mês no 0 (Janeiro = 0). Instanciamos a data exata.
  //     const dataTeste = new Date(ano, mes - 1, dia);
  //
  //     // Se ao instanciar o JS "empurrar" o dia (ex: 31 de Fev vira 02 de Mar),
  //     // os valores não vão bater
  //     if (
  //       dataTeste.getFullYear() !== ano ||
  //       dataTeste.getMonth() + 1 !== mes ||
  //       dataTeste.getDate() !== dia
  //     ) {
  //       return { kind: 'dataInvalida', message: 'Data inválida 2' };
  //     }
  //   }
  //
  //   return null; // A data é real e válida!
  // }
}
