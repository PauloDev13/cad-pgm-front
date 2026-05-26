import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { Router } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TRegisterNewUser } from '../../../features/usuario/models/usuario.model';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { LoginStateService } from '../services/login-state.service';

type AuthState = {
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoading: false,
  error: null
};

type TRegisterUser = Omit<TRegisterNewUser, 'confirmPassword'> & {}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((
    store,
    authService = inject(AuthService),
    notificationService = inject(NotificationService),
    loginStateService = inject(LoginStateService),
    router = inject(Router)
  ) => ({
    registerUser: rxMethod<TRegisterUser>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) => authService.registerNewUserPublic(payload)
          .pipe(
            tapResponse({
              next: (response) => {
                patchState(store, { isLoading: false });
                loginStateService.newUserName.set(response.userName);
                notificationService.success(
                  `Usuário <strong>${response.userName}</strong> cadastrado.`,
                  'Register'
                );

                router.navigate(['/auth/login']);
              },
              error: (err: Error) => {
                patchState(store, { isLoading: false, error: err.message });
                notificationService.error(err.message, 'Register');
              }
            })
          )
        )
      )
    )
  }))
);
