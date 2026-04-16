import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ILoggedUser } from '../models/auth.model';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../../shared/service/NotificationSnackbar.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  const user: ILoggedUser | null = authService.currentUser();

  let authReq = req;

  if (user && user.token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        authService.logout();

        notificationService.warning('Sua sessão expirou. Faça login novamente');

        router.navigate(['/auth/login']).then();
      }

      return throwError(() => error);
    })
  );
};
