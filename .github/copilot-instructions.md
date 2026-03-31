# Copilot Instructions

## Commands

```bash
npm start               # Dev server on localhost:4200
npm run build           # Production build → dist/onecx-document-management-ui
npm run test            # Run all Jest tests
npm run test:ci         # CI mode: no watch, headless, with coverage
npm run lint            # ESLint
npm run lint:fix        # ESLint with auto-fix
npm run format          # Prettier on uncommitted files
npm run apigen          # Regenerate OpenAPI client from swagger spec
```

**Single test file:**

```bash
npx jest src/app/document/service/external-file-handler.service.spec.ts
# or with NX:
npx nx test --testFile="path/to/file.spec.ts"
```

## Architecture

This is an **Angular 18 micro-frontend** built with NX 19. It runs embedded in the OneCX portal shell via **Module Federation** — the entry point is `src/main.ts`, which exposes `OnecxDocumentManagementUiModule`.

**Feature structure** (`src/app/document/`): one lazy-loaded feature module with four pages. Each page is a self-contained slice:

```
pages/document-search/
  document-search.actions.ts      # NgRx actions
  document-search.effects.ts      # Side effects (API calls)
  document-search.reducers.ts     # State reducer
  document-search.selectors.ts    # Memoized selectors
  document-search.viewmodel.ts    # Combined Observable view model
  document-search.state.ts        # State type
  document-search.parameters.ts   # Zod schema for URL params
  document-search.columns.ts      # Table column config
  document-search.component.ts    # Smart container component
  components/                     # Dumb/presentational components
```

**Routing**: Root router uses a `startsWith('document-management')` matcher (from `@onecx/angular-webcomponents`) to lazy-load the document feature. Child routes: `''` → search, `create-document`, `details/:id`, `quick-upload`.

**State**: NgRx with `createFeature`. Root state in `app.reducers.ts`; feature state in `document.reducers.ts` with sub-slices per page. Router state is synced via `StoreRouterConnectingModule`.

**API layer**: `src/app/shared/generated/` is **entirely auto-generated** from `src/assets/swagger/onecx-document-management-ui-bff.yaml`. Do not edit files there — run `npm run apigen` instead. Services use `providedIn: 'any'`.

## Key Conventions

### Smart vs Dumb Components

- **Smart (container) components** live in `pages/` — they connect to the NgRx store, dispatch actions, and expose Observables to templates via `async` pipe.
- **Dumb (presentational) components** live in `components/` — they receive data via `@Input()` and emit via `@Output()`. No store access, no side effects.

### NgRx Pattern

Each page slice follows this flow:

1. Component dispatches action → `store.dispatch(PageActions.someAction({...}))`
2. Effect listens → calls generated API service → dispatches success/failure action
3. Reducer updates state
4. Component selects via `viewmodel$` Observable that combines multiple selectors

### Component Selectors

All component selectors use prefix `app-` with kebab-case (`app-document-search`). Directive selectors use `app` prefix with camelCase.

### Architecture: NgModule (not Standalone)

Uses traditional **NgModule-based** architecture. Components are declared in their feature module, not standalone.

### HTTP / API Services

Generated services (`DocumentControllerV1`, `FileControllerV1`, etc.) are injected directly. The `ExternalFileHandlerService` uses `HttpBackend` directly (bypasses interceptors) for file upload/download with retry logic (3 retries).

API base URL is configured via `apiConfigProvider()` in `shared/utils/apiConfigProvider.utils.ts`, which reads from `ConfigurationService` and `AppStateService`.

### i18n

Uses `@ngx-translate/core`. Translation files: `src/assets/i18n/{en,de,...}.json`. In templates: `{{ 'SOME.KEY' | translate }}`. In code: `this.translateService.instant('KEY')`. The translate loader is initialized before app bootstrap via `translateServiceInitializer`.

### Forms

Reactive forms (`FormBuilder`, `FormGroup`). URL parameter state is validated with **Zod** schemas (`*.parameters.ts` files) — use Zod for any new URL/query param schema.

### Testing

- Uses Jest + `jest-preset-angular`
- Imports: `HttpClientTestingModule`, `RouterTestingModule`, `TranslateTestingModule.withTranslations({})`, `MockAuthModule` from portal integration
- Services accessed via `TestBed.inject()`
- Generated files in `src/app/shared/generated/` are excluded from lint rules

### Portal Integration

Heavy dependency on `@onecx/*` packages:

- `PortalMessageService` — show toast/notifications
- `BreadcrumbService` — set page breadcrumbs
- `AppStateService` / `ConfigurationService` — app config
- `providePortalDialogService()` — modal dialogs
- Auth via Keycloak through `@onecx/keycloak-auth`

### Styling

All layout and spacing is done with **PrimeFlex** utility classes (e.g., `flex`, `gap-2`, `p-3`, `col-12`). Do not write custom CSS for layout concerns that PrimeFlex already covers.

### File Organization

Each file should contain **one kind of structure only** — a file holds either types/interfaces, or functions/utilities, or a class/service, not a mix. Place files according to their scope:

- Used by a single component → place inside that component's directory
- Shared across multiple features → place in the appropriate shared directory (`shared/`, `components/`, `utils/`, etc.) based on what it is

### Lean Components

Components should contain minimal logic. Business logic, data transformation, and side effects belong in **services** or **NgRx effects**, not in component classes. Components are responsible for connecting the store and the template — nothing more.

### Simplicity Over Defensiveness

Avoid overly defensive code. Do not add redundant null/undefined guards, excessive try/catch blocks, or protective checks that are not warranted by actual failure scenarios. Trust the types and keep the code straightforward.

### Encapsulate Complex Conditions

Any condition with more than two branches (e.g., checking validity, state, or multiple flags at once) must be extracted into a named method:

```typescript
// ❌ inline — hard to read and reuse
*ngIf="control.invalid && (control.dirty || control.touched) && !loading"

// ✅ extracted
isControlInvalid(): boolean {
  return this.control.invalid && (this.control.dirty || this.control.touched) && !this.loading;
}
```

Name the method to express intent (`isValid`, `canSubmit`, `hasError`, etc.).

### Code Style

- Single quotes (Prettier), SCSS for styles
- Strict TypeScript (`strict: true`, `strictTemplates: true`)
- Lint staged: ESLint on `.ts/.html`, Prettier on `.json/.scss/.md/.yml`
