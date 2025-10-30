// Caminho: src/app/app.config.ts
// (Adicionado withDebugTracing)

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
// Habilita rastreamento de rotas 'withDebugTracing'
import { provideRouter, withDebugTracing } from '@angular/router';

import { routes } from './app.routes';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptor/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Habilita o rastreamento de rotas
    provideRouter(routes, withDebugTracing()),
    provideEnvironmentNgxMask(),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
  ]
};