import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { computed, inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { Router } from '@angular/router';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TRegisterNewUser } from '../../../features/usuario/models/usuario.model';
import { finalize, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { IAuthRequest, IDecodedToken, IDecodedTokenUsername } from '../models/auth.model';
import { jwtDecode } from 'jwt-decode';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { isPlatformBrowser } from '@angular/common';

type AuthState = {
  isLoading: boolean;
  error: string | null;
  currentUser: IDecodedToken | null;
  token: string | null;
  rememberedUsername: string;
  resetTokenStatus: 'idle' | 'validating' | 'valid' | 'invalid';
}

const initialState: AuthState = {
  isLoading: false,
  error: null,
  currentUser: null,
  rememberedUsername: '',
  token: null,
  resetTokenStatus: 'idle'
};

type TRegisterUser = Omit<TRegisterNewUser, 'confirmPassword'> & {}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((state) => {
    const userRoles = computed(() => state.currentUser()?.roles ?? []);

    return {
      isLoggedIn: computed(() => !!state.token),
      isForcedPasswordChanged: computed(() => state.currentUser()?.isForcePasswordChange ?? false),
      userRoles,
      // Lógicas de negócio centralizadas
      canEdit: computed(() => userRoles().includes('admin') || userRoles().includes('rh')),
      canManager: computed(() => userRoles().includes('admin'))
    };
  }),

  withMethods((
    store,
    errorHandlerService = inject(ErrorHandlerService),
    notificationService = inject(NotificationService),
    authService = inject(AuthService),
    platformId = inject(PLATFORM_ID),
    router = inject(Router)
  ) => ({
    login: rxMethod<IAuthRequest>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((credentials) => authService.login(credentials).pipe(
          finalize(() => patchState(store, { isLoading: false })),
          tapResponse({
            next: (response) => {
              const decodedToken = jwtDecode<IDecodedToken>(response.token);

              patchState(store, {
                token: response.token,
                currentUser: decodedToken
              });

              if (isPlatformBrowser(platformId)) {
                // Guardamos o token do usuário logado no local storage
                localStorage.setItem('jwt-token', response.token);
              }

              // Centraliza o redirecionamento com base nas regras do Token
              if (decodedToken.isForcePasswordChange) {
                router.navigate(['auth/troca-obrigatoria']);
              } else {
                router.navigate(['home']);
              }
            },
            error: (err) => {
              errorHandlerService.handle(err, 'Login');
            }
          })
        ))
      )
    ),

    forcePasswordChange: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((newPassword) => {
          const userName = store.currentUser()?.sub || '';

          if (!userName) {
            patchState(store, { isLoading: false });
            notificationService.error('Usuário não encontrado na sessão');
          }
          return authService.forcePasswordChange(userName, newPassword).pipe(
            finalize(() => patchState(store, { isLoading: false })),
            tapResponse({
              next: () => {
                // loginStateService.newUserName.set(userName);

                notificationService.success(
                  'Senha atualizada com sucesso! Por favor, faça login com a nova senha.',
                  'Troca de Senha');

                authService.logout();

                patchState(store, {
                  ...initialState,
                  rememberedUsername: userName
                });
                router.navigate(['auth/login']);

              },
              error: (err) => {
                errorHandlerService.handle(err, 'Troca de Senha');
              }
            })
          );
        })
      )
    ),

    // Valida o Token assim que a tela abre
    validateResetToken: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { resetTokenStatus: 'validating' })),
        switchMap((token) =>
          authService.validateResetToken(token).pipe(
            tapResponse({
              next: () => patchState(store, { resetTokenStatus: 'valid' }),
              error: (err) => {
                patchState(store, { resetTokenStatus: 'invalid' });
                errorHandlerService.handle(err, 'Validação Link');
              }
            })
          )
        )
      )
    ),

    // Envia a nova senha
    resetPassword: rxMethod<{ token: string, password: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ token, password }) => {
          const userName = jwtDecode<IDecodedTokenUsername>(token).username;

          return authService.resetPassword(token, password).pipe(
            tapResponse({
              next: () => {
                notificationService.success(
                  'Senha atualizada com sucesso! Você já pode acessar o sistema.',
                  'Senha'
                );
                // Limpa o status do reset para evitar lixo em acessos futuros
                patchState(store, {
                  resetTokenStatus: 'idle',
                  rememberedUsername: userName
                });

                router.navigate(['auth/login']);
              },
              error: (err) => errorHandlerService.handle(err, 'Link')
            }),
            finalize(() => patchState(store, { isLoading: false }))
          );
        })
      )
    ),

    forgotPassword: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((email) => authService.forgotPassword(email).pipe(
          finalize(() => patchState(store, { isLoading: false })),
          tapResponse({
            next: () => {
              notificationService.success(
                `Você receberá um <strong>link</strong> de redefinição no E-mail informado.`,
                'E-mail'
              );

              // Redireciona de volta para o login para aguardar o acesso
              router.navigate(['auth/login']);
            },
            error: (err) => {
              errorHandlerService.handle(err, 'Envio E-mail');
            }
          })
        ))
      )
    ),

    resetPasswordByAdmin: rxMethod<{
      userId?: number; onSuccess: (temporaryPassword: string) => void
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ userId, onSuccess }) =>
          authService.resetPasswordByAdmin(userId).pipe(
            tapResponse({
              next: (response) => {
                // A Store não abre o dialog, ela apenas entrega a senha de volta ao Componente!
                onSuccess(response.temporaryPassword);
              },
              error: (err) => errorHandlerService.handle(err, 'Reset por Admin')
            }),
            finalize(() => patchState(store, { isLoading: false }))
          )
        )
      )
    ),

    logout() {
      if (isPlatformBrowser(platformId)) {
        localStorage.removeItem('jwt-token'); // Limpa ao sair
      }
      patchState(store, initialState);
      authService.logout();
      router.navigate(['/auth/login']);
    },

    // Utilidade para o componente forçar o estado de inválido se não vier token na URL
    setResetTokenInvalid() {
      patchState(store, { resetTokenStatus: 'invalid' });
    },

    registerUser: rxMethod<TRegisterUser>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) => authService.registerNewUserPublic(payload)
          .pipe(
            finalize(() => patchState(store, { isLoading: false })),
            tapResponse({
              next: (response) => {

                patchState(store, { rememberedUsername: response.userName });

                // loginStateService.newUserName.set(response.userName);

                notificationService.success(
                  `Usuário <strong>${response.userName}</strong> cadastrado.`,
                  'Register'
                );

                router.navigate(['/auth/login']);
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandlerService.handle(err, 'Register');
              }
            })
          )
        )
      )
    )
  })),
  withHooks({
    onInit(store) {
      const platformId = inject(PLATFORM_ID);

      if (isPlatformBrowser(platformId)) {
        const token = localStorage.getItem('jwt-token');
        if (token) {
          try {
            const decoded = jwtDecode<IDecodedToken>(token);
            const expirationTime = (decoded.exp || 0) * 1000;
            const currentTime = new Date().getTime();

            // Se expirou, destrói e manda pro login
            if (currentTime >= expirationTime) {
              localStorage.removeItem('jwt-token');
              // O store.logout() (se definido nos métodos) garante a rota e limpeza
              patchState(store, initialState);
            } else {
              // Se é válido, hidrata a Store (O App acorda logado!)
              patchState(store, {
                token: token,
                currentUser: decoded
              });
            }
          } catch (err) {
            localStorage.removeItem('jwt-token');
            patchState(store, initialState);
          }
        }
      }
    }
  })
);
