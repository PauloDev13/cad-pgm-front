import { minLength, required, schema, validate } from '@angular/forms/signals';
import { IAuthForm } from '../models/auth.model';
import { signal } from '@angular/core';

export const initialAuth: IAuthForm = {
  password: '',
  confirmPassword: ''
};

export const authFormModel = signal<IAuthForm>(initialAuth);

export const subscriptionSchema = schema<IAuthForm>((path) => {
  required(path.password, { message: 'A nova senha é obrigatória' });

  minLength(path.password, 6, { message: 'A senha deve ter no mínimo 6 caracteres' });

  required(path.confirmPassword, { message: 'A confirmação é obrigatória' });

  validate(path.confirmPassword, ({ value, valueOf }) => {
    // const senhaOriginal = authFormModel().password;
    const password = valueOf(path.password);
    const confirmPassword = value();

    if (confirmPassword !== password && confirmPassword.length) {
      return { kind: 'passwordMismatch', message: 'As senhas não conferem' };
    }
    return null;
  });
});


