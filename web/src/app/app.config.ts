import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './routes/app.routes';

import {provideHttpClient} from "@angular/common/http";
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from './core/auth/services/auth.service';
import { AuthStore } from './core/auth/auth.store';
import { catchError, tap } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const auth = inject(AuthService);
        const store = inject(AuthStore);
        // Hydrate auth state before initial navigation
        return () => firstValueFrom(
          auth.me().pipe(
            tap(user => store.setUser(user)),
            catchError(() => {
              store.clear();
              return of(null);
            })
          )
        );
      }
    },
    provideTranslateService({
      lang: 'fr',
      fallbackLang: 'fr',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    }),
  ]
};
