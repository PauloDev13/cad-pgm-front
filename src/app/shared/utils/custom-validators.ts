import { DateValidationState } from './date-adapter';

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
  static dataValida(value: any): { kind: string; message: string } | null {
    // ✨ O Pulo do Gato: O valor chegou nulo, MAS o alarme disparou no Adapter?
    // Então sabemos que não está vazio, o usuário digitou lixo!
    if (!value && DateValidationState.isInvalid) {
      return { kind: 'dataInvalida', message: 'A data informada é inválida.' };
    }

    // Se está vazio e o alarme NÃO tocou, é porque está vazio mesmo. Deixa pro Required.
    if (!value) return null;

    // Se chegou a instância do erro diretamente
    if (value instanceof Date && isNaN(value.getTime())) {
      return { kind: 'dataInvalida', message: 'A data informada é inválida.' };
    }

    // if (!value) return null;

    // Se o Angular Material já converteu para Date e percebeu que é inválido (Invalid Date)
    if (value instanceof Date && isNaN(value.getTime())) {
      return { kind: 'dataInvalida', message: 'Data inválida.' };
    }

    // Se o valor for a string digitada "DD/MM/YYYY"
    if (typeof value === 'string') {
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = value.match(regex);

      if (!match) {
        return { kind: 'dataInvalida', message: 'Formato inválido. Use DD/MM/AAAA.' };
      }

      const dia = parseInt(match[1], 10);
      const mes = parseInt(match[2], 10);
      const ano = parseInt(match[3], 10);

      // O JS começa o mês no 0 (Janeiro = 0). Instanciamos a data exata.
      const dataTeste = new Date(ano, mes - 1, dia);

      // Se ao instanciar o JS "empurrar" o dia (ex: 31 de Fev vira 02 de Mar), os valores não vão bater
      if (
        dataTeste.getFullYear() !== ano ||
        dataTeste.getMonth() + 1 !== mes ||
        dataTeste.getDate() !== dia
      ) {
        return { kind: 'dataInvalida', message: 'Data inválida' };
      }
    }

    return null; // A data é real e válida!
  }

  // Validador de Algoritmo Real de CPF
  // static cpfValido(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const value = control.value;
  //     if (!value) return null;
  //
  //     // Remove tudo que não for número
  //     const cpf = value.toString().replace(/\D/g, '');
  //
  //     // Verifica tamanho e se todos os dígitos são iguais (ex: 111.111.111-11)
  //     if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
  //       return { cpfInvalido: true };
  //     }
  //
  //     let soma = 0;
  //     let resto;
  //
  //     // Validação do primeiro dígito verificador
  //     for (let i = 1; i <= 9; i++) {
  //       soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  //     }
  //     resto = (soma * 10) % 11;
  //     if (resto === 10 || resto === 11) resto = 0;
  //     if (resto !== parseInt(cpf.substring(9, 10))) return { cpfInvalido: true };
  //
  //     soma = 0;
  //     // Validação do segundo dígito verificador
  //     for (let i = 1; i <= 10; i++) {
  //       soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  //     }
  //     resto = (soma * 10) % 11;
  //     if (resto === 10 || resto === 11) resto = 0;
  //     if (resto !== parseInt(cpf.substring(10, 11))) return { cpfInvalido: true };
  //
  //     return null; // Válido!
  //   };
  // }
}
