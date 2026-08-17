import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { DoBootstrap, inject, Injector, isDevMode, NgModule, provideAppInitializer } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router, RouterModule } from '@angular/router'
import { Actions, EffectsModule, EffectSources, EffectsRunner } from '@ngrx/effects'
import { StoreRouterConnectingModule } from '@ngrx/router-store'
import { StoreModule } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'

import { AngularAuthModule } from '@onecx/angular-auth'
import { createAppEntrypoint, initializeRouter } from '@onecx/angular-webcomponents'
import { AppStateService, ConfigurationService } from '@onecx/angular-integration-interface'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'
import {
  createTranslateLoader,
  providePermissionService,
  provideThemeConfig,
  provideTranslationPathFromMeta
} from '@onecx/angular-utils'

import { AppEntrypointComponent } from './app-entrypoint.component'
import { routes } from './app-routing.module'
import { metaReducers, reducers } from './app.reducers'
import { Configuration } from './shared/generated'
import { apiConfigProvider } from './shared/utils/apiConfigProvider.utils'

// Workaround for the following issue:
// https://github.com/ngrx/platform/issues/3700
const effectProvidersForWorkaround = [EffectsRunner, EffectSources, Actions]
effectProvidersForWorkaround.forEach((p) => (p.ɵprov.providedIn = null))

@NgModule({
  imports: [
    AppEntrypointComponent,
    AngularAcceleratorModule,
    RouterModule.forRoot(routes),
    TranslateModule.forRoot({
      extend: true,
      isolate: false,
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient, AppStateService]
      }
    }),
    BrowserAnimationsModule,
    AngularAuthModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot(effectProvidersForWorkaround),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: !isDevMode(), // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
      trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
      traceLimit: 75 // maximum stack trace frames to be stored (in case trace option was provided as true)
    })
  ],
  exports: [],
  providers: [
    {
      provide: Configuration,
      useFactory: apiConfigProvider,
      deps: [ConfigurationService, AppStateService]
    },
    provideAppInitializer(() => {
      const initializerFn = initializeRouter(inject(Router), inject(AppStateService))
      return initializerFn()
    }),
    providePermissionService(),
    provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'),
    provideHttpClient(withInterceptorsFromDi()),
    provideThemeConfig()
  ]
})
export class OneCXDocumentModule implements DoBootstrap {
  constructor(private readonly injector: Injector) {}

  ngDoBootstrap(): void {
    createAppEntrypoint(AppEntrypointComponent, 'ocx-document-component', this.injector)
  }
}
