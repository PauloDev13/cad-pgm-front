interface IValidator {
  kind: string;
  message: string;
}

export class Validators {

  private static parseMonthYear(value: string): Date {
    const [mm, yyyy] = value.trim().split('/').map(Number);
    return new Date(yyyy, mm - 1, 1);
  }

  static isValidMonthYear(value: string): IValidator | null {
    const v = (value || '').trim();

    if (!/^\d{2}\/\d{4}$/.test(v)) {
      return {
        kind: 'invalidDate',
        message: 'Data inválida'
      };
    }

    const [mm, yyyy] = v.split('/').map(Number);

    if (mm < 1 || mm > 12) {
      return {
        kind: 'invalidDate',
        message: 'Data inválida'
      };
    }

    if (yyyy < 1900 || yyyy > 2100) {
      return {
        kind: 'invalidDate',
        message: 'Data inválida'
      };
    }
    return null;
  }

  static isInvalidPeriod(dateStart: string, dateEnd: string): IValidator | null {
    const dStart = this.parseMonthYear(dateStart);
    const dEnd = this.parseMonthYear(dateEnd);


    if (dEnd < dStart) {
      return {
        kind: 'invalidPeriod',
        message: 'A Data é anterior a Data Inicial'
      };
    }
    return null;
  }

  static optionsValidateFile(excel: boolean, pdf: boolean): IValidator | null {
    if (!excel && !pdf) {
      return {
        kind: 'invalidOptions',
        message: 'Escolha pelo menos um tipo de arquivo'
      };
    }
    return null;
  }
}
