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
        message: `Idade mínima: ${minAge} anos. A informada: ${age} anos. `
      };
    }

    return null; // Válido!
  }


  static cpfValidator(value: string): { kind: string; message: string } | null {
    // Se o campo estiver vazio, não validamos o CPF.
    // Deixe que o validador 'Validators.required' cuide disso se for um campo obrigatório.
    if (!value) {
      return null;
    }

    // Limpa a formatação: remove pontos, traços e qualquer caractere não numérico
    const cpf = value.replace(/\D/g, '');

    // Verifica o tamanho correto
    if (cpf.length !== 11) {
      return {
        kind: 'invalidCpf',
        message: `CPF: ${value} inválido `
      };
    }

    // Bloqueia CPFs com sequências de números repetidos (ex: 111.111.111-11),
    // que passam na fórmula matemática mas são inválidos na vida real.
    if (/^(\d)\1{10}$/.test(cpf)) {
      return {
        kind: 'invalidCpf',
        message: `CPF: ${value} inválido `
      };
    }

    // Cálculo do primeiro dígito verificador
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) {
      return {
        kind: 'invalidCpf',
        message: `CPF: ${value} inválido `
      };
    }

    // Cálculo do segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) {
      return {
        kind: 'invalidCpf',
        message: `CPF: ${value} inválido `
      };
    }

    // Se passou por todas as barreiras, o CPF é válido!
    return null;
  }
}
