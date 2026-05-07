import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getPortuguesePaginatorIntl } from './shared/utils/custom-paginator-intl';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { DatePipe } from '@angular/common';
import { CustomDateAdapter } from './shared/utils/custom-date-adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    DatePipe,
    // permite a exibição do calendário no componente Datepicker
    // provideNativeDateAdapter(),
    provideEnvironmentNgxMask(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MatPaginatorIntl, useValue: getPortuguesePaginatorIntl() },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
};
