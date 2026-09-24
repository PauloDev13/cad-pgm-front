import { required, schema, validate } from '@angular/forms/signals';
import { signal } from '@angular/core';
import { ConsultaFormModel } from '../models/ponto-eletronico.model';
import { CustomValidators } from '../../../shared/utils/custom-validators';
import { Validators } from './validators';

export const initialModel: ConsultaFormModel = {
  cpf: '',
  unit: '',
  dateStart: '',
  dateEnd: '',
  excel: true,
  pdf: false
};

export const consultaFormModel = signal<ConsultaFormModel>(initialModel);

export const subscriptionSchema = schema<ConsultaFormModel>((path) => {
  required(path.cpf, { message: 'CPF é obrigatório' });
  validate(path.cpf, ({ value }) => CustomValidators.cpfValidator(value()));

  required(path.unit, { message: 'O código da unidade é obrigatório' });

  required(path.dateStart, { message: 'Data Inicial é obrigatória' });
  validate(path.dateStart, ({ value }) => Validators.isValidMonthYear(value()));

  required(path.dateEnd, { message: 'Data Inicial é obrigatória' });
  validate(path.dateEnd, ({ value }) => Validators.isValidMonthYear(value()));

  validate(path.dateEnd, ({ value, valueOf }) => {
    const dateStart = valueOf(path.dateStart);
    const dateEnd = value();

    return Validators.isInvalidPeriod(dateStart, dateEnd);
  });
  
  // todo Decidir depois o uso desta validação
  // validate(path.excel, ({ value, valueOf }) => {
  //   const pdf = valueOf(path.pdf);
  //   const excel = value();
  //
  //   return Validators.optionsValidateFile(excel, pdf);
  // });
});


