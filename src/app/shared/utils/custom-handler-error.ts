import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export const customHandlerError = (err: HttpErrorResponse) => {
  console.error('Erro na API:', err);
  return throwError(() => err);
};

