import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, distinctUntilChanged, Observable, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { IUserQueryParams, IUsuarioResponse, TUsuarioDelete } from '../models/usuario.model';

type UserState = {
  roles: string[];
  isLoading: boolean;

  // Estado da listagem
  usuarios: IUsuarioResponse[];
  totalElements: number;

  // Estado dos filtros e paginação
  searchTerm: string;
  searchType: 'NOME' | 'LOGIN' | 'EMAIL';
  currentPage: number;
  pageSize: number;

  // Gatilho invisível para forçar recarregamento (ex: após deletar)
  reloadTrigger: number;
};

const initialState: UserState = {
  roles: [],
  isLoading: false,
  usuarios: [],
  totalElements: 0,
  searchTerm: '',
  searchType: 'NOME',
  currentPage: 0,
  pageSize: 10,
  reloadTrigger: 0
};

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // SELECTORS COMPUTADOS
  withComputed((store) => ({
    queryParams: computed((): IUserQueryParams => {
      const termo = store.searchTerm();
      const tipo = store.searchType();

      store.reloadTrigger();

      return {
        page: store.currentPage(),
        size: store.pageSize(),
        name: tipo === 'NOME' && termo ? termo : undefined,
        userName: tipo === 'LOGIN' && termo ? termo : undefined,
        email: tipo === 'EMAIL' && termo ? termo : undefined
      };
    })
  })),

  // MÉTODOS DE AÇÃO E MUTAÇÃO
  withMethods((
    store,
    usuarioService = inject(UsuarioService),
    notificationService = inject(NotificationService),
    errorHandlerService = inject(ErrorHandlerService)
  ) => ({

    updateLocalUser(updatedUser: any) {
      // O patchState aceita uma função de callback quando precisamos ler o estado anterior
      // para gerar o novo estado (idêntico ao funcionamento do resource.update)
      patchState(store, (state) => ({
        usuarios: state.usuarios.map(user =>
          user.id === updatedUser.id ? updatedUser : user
        )
      }));
    },
    // Atualiza os filtros e volta para a primeira página
    updateSearchType(type: 'NOME' | 'LOGIN' | 'EMAIL') {
      patchState(store, { searchType: type, searchTerm: '', currentPage: 0 });
    },

    // Método reativo (Funil RxJS) para a digitação
    updateSearchTermDebounced: rxMethod<string>(
      pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((termoDigitado) => {
          const termoLimpo = termoDigitado.trim();

          // Regra de Negócio preservada: Só busca se for vazio ou tiver >= 3 caracteres
          if (termoLimpo === '' || termoLimpo.length >= 3) {
            patchState(store, { searchTerm: termoLimpo, currentPage: 0 });
          }
        })
      )
    ),

    // Atualiza a paginação
    updatePagination(page: number, size: number) {
      patchState(store, { currentPage: page, pageSize: size });
    },

    // Força o recarregamento da lista (Usaremos isso no Delete!)
    reloadList() {
      patchState(store, { reloadTrigger: store.reloadTrigger() + 1 });
    },

    // Buscar Usuários
    loadUsers: rxMethod<IUserQueryParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((params) => usuarioService.searchFilter(params)
          .pipe(
            tapResponse({
              next: (response) => patchState(store, {
                usuarios: response.content,
                totalElements: response.page.totalElements ?? 0,
                isLoading: false
              }),
              error: (err) => {
                patchState(store, { isLoading: false, usuarios: [] });
                errorHandlerService.handle(err, 'Buscar Usuários');
              }
            })
          ))
      )
    ),

    // Busca Roles
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

    // Salvar Usu´rio
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
    ),

    // Excluir Usuário
    deleteUser: rxMethod<{ payload: TUsuarioDelete, onSuccess: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ payload, onSuccess }) =>
          usuarioService.delete(payload).pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                onSuccess();
              },
              error: (err) => {
                patchState(store, { isLoading: false });
                errorHandlerService.handle(err, 'Excluir');
              }
            })
          )
        )
      )
    )
  })),
  // HOOKS DE CICLO DE VIDA (A Mágica acontece aqui!)
  withHooks({
    onInit(store) {
      store.loadUsers(store.queryParams);
    }
  })
);
