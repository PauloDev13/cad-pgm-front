import { TRegisterNewUser, TUsuarioUpdate } from '../models/usuario.model';
import { email, maxLength, minLength, required, schema, validate } from '@angular/forms/signals';

export const initialDataUsuario: TUsuarioUpdate = {
  name: '',
  userName: '',
  email: '',
  activated: true,
  permissions: ['guest'],
  forcePasswordChange: false
};

export const subscriptionSchema = schema<TUsuarioUpdate>((path) => {
  // Nome completo
  required(path.name, { message: 'Nome completo é obrigatório' });
  minLength(path.name, 5, { message: 'O Nome deve ter no mínimo 5 caracteres' });

  // Login
  required(path.userName, { message: 'login é obrigatório' });
  minLength(path.userName, 5, { message: 'O Login deve ter no mínimo 5 caracteres' });
  maxLength(path.userName, 30, { message: 'O Login deve ter no máximo 30 caracteres' });

  // E-mail
  required(path.email, { message: 'E-mail é obrigatório' });
  email(path.email, { message: 'E-mail inválido' });
});

export const initialDataRegisterUsuario: TRegisterNewUser = {
  name: '',
  userName: '',
  email: '',
  password: '',
  confirmPassword: ''
};

export const subscriptionSchemaRegisterUsuario = schema<TRegisterNewUser>((path) => {
  // Nome completo
  required(path.name, { message: 'Nome completo é obrigatório' });
  minLength(path.name, 5, { message: 'O Nome deve ter no mínimo 5 caracteres' });
  // Login
  required(path.userName, { message: 'login é obrigatório' });
  minLength(path.userName, 5, { message: 'O Login deve ter no mínimo 5 caracteres' });
  maxLength(path.userName, 30, { message: 'O Login deve ter no máximo 30 caracteres' });
// Password
  required(path.password!, { message: 'Senha é obrigatória' });
  minLength(path.password!, 6, { message: 'Senha deve ter no mínimo 6 caracteres' });

// ConfirmPassword
  required(path.confirmPassword!, { message: 'Confirme a Senha' });
  validate(path.confirmPassword!, ({ value, valueOf }) => {
    const confirm = value();
    const password = valueOf(path.password);

    if (confirm !== password) {
      return {
        kind: 'passwordMismatch', // Um identificador único para o erro
        message: 'As senhas não conferem'
      };
    }
    return null;
  });

// E-mail
  required(path.email, { message: 'E-mail é obrigatório' });
  email(path.email, { message: 'E-mail inválido' });
});
