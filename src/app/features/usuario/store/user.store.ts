import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { IUsuarioResponse } from '../models/usuario.model';

type UserState = {
  roles: string[];
  isLoading: boolean;
};

const initialState: UserState = {
  roles: [],
  isLoading: false
};

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withMethods((
    store,
    usuarioService = inject(UsuarioService),
    notificationService = inject(NotificationService),
    errorHandlerService = inject(ErrorHandlerService)
  ) => ({
    loadRoles: rxMethod<void>(
      pipe(
        switchMap(() => usuarioService.getRoles().pipe(
          tapResponse({
            next: (response) => patchState(store, { roles: response.roles }),
            error: (err) => errorHandlerService.handle(err, 'Permissões')
          })
        ))
      )
    ),
    saveUser: rxMethod<{
      isEdit: boolean;
      userId?: number;
      rawPayload: any;
      onSuccess: (payload: any) => void;
    }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ isEdit, userId, rawPayload, onSuccess }) => {
          let request$: Observable<IUsuarioResponse | any>;
          const actionName = isEdit ? 'Atualização' : 'Cadastro';

          if (isEdit) {
            if (rawPayload.forcePasswordChange) {
              rawPayload.password = 'pgm@1234';
              request$ = usuarioService.updatePut(userId!, rawPayload);
            } else {
              const { password, ...payloadPatch } = rawPayload;
              request$ = usuarioService.updatePatch(userId!, payloadPatch);
            }
          } else {
            rawPayload.password = 'pgm@1234';
            request$ = usuarioService.create(rawPayload);
          }
          return request$.pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                notificationService.success(`Usuário ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`, actionName);
                onSuccess(rawPayload);
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandlerService.handle(err, actionName);
              }
            })
          );
        })
      )
    )
  }))
);
