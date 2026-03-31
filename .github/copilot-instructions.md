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
- Services accessed via `TestBed.inject()`
- Generated files in `src/app/shared/generated/` are excluded from lint rules

#### Test scope — what to test

Test **business logic only**. Do not test UI/DOM rendering, CSS classes, or template structure.

- **Components** — dispatched actions, method outputs, form state transitions, Observable wiring
- **Effects** — dispatched actions for each branch (success, failure, guard conditions), side-effect calls (navigate, messageService, exportService)
- **Reducers** — every `on()` handler: state shape before → state shape after
- **Selectors** — every `projector` function in isolation (pure function, no store needed)
- **Services** — HTTP calls (method, URL, body), retry logic, error propagation
- **Utils / factories** — every exported function and every branch within it

#### Test naming

Every test name must follow `should <behavior> when <condition>`:

```typescript
// ❌ vague
it('works correctly');
it('handles error');

// ✅ self-documenting
it('should dispatch documentSearchResultsLoadingFailed when API returns error');
it('should set searchLoadingIndicator to false when results are received');
```

#### Test structure — one assertion per test

Each test verifies a single, clearly scoped behavior. Avoid combining multiple unrelated assertions in one `it` block.

#### Edge cases

Test only edge cases that can realistically occur in production:

- Empty arrays / `undefined` / `null` values coming from the API
- Missing required IDs (`id` is `undefined`)
- HTTP error responses (400, 500)
- Pending count reaching zero (upload tracking)

Do **not** invent theoretical edge cases that the application code will never encounter.

#### Mock strategy

| Subject                                                         | Tool                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| NgRx Store                                                      | `MockStore` + `provideMockActions`                                  |
| HTTP services                                                   | `jest.fn()` returning `of(...)` or `throwError(...)`                |
| HTTP client directly                                            | `HttpClientTestingModule` (required when `HttpBackend` is injected) |
| Router                                                          | `jest.fn()` mock with `navigate`, `parseUrl`                        |
| Portal services (`PortalMessageService`, `PortalDialogService`) | `jest.fn()` mock                                                    |
| Selectors                                                       | `store.overrideSelector(...)`                                       |

#### Private methods

Do **not** access private methods via `(component as any).method()`. Test them indirectly through the public API (actions, outputs, public method calls) that exercises the private code path.

#### NgRx Effects — testing pattern

```typescript
effects.someEffect$.pipe(take(1)).subscribe((action) => {
  expect(action).toEqual(SomeActions.expectedAction({ ... }));
  done();
});
actions$.next(SomeActions.triggerAction());
```

Use `concatLatestFrom` selectors with `store.overrideSelector(...)` before triggering the action.

#### TestBed setup — preferred approach

Use the modern provider API instead of legacy testing modules:

```typescript
// ❌ legacy — forbidden
imports: [HttpClientTestingModule];
imports: [RouterTestingModule];

// ✅ preferred
providers: [provideHttpClient(), provideHttpClientTesting()];
providers: [provideRouter([])];
```

Always include `provideAppStateServiceMock()` from `@onecx/angular-integration-interface/mocks` — `PortalCoreModule` and many portal services depend on `AppStateService` at initialization.

#### Component TestBed — no NO_ERRORS_SCHEMA

**Do not use `NO_ERRORS_SCHEMA`** in component tests. Even when testing business logic only (not UI), the component must compile and instantiate correctly with its real template. `NO_ERRORS_SCHEMA` silently stubs child components and custom elements, which can mask real setup errors and break harness-based queries.

Instead, declare all child components used in the template, or import the real PrimeNG / OneCX modules they need:

```typescript
// ❌ hides real template errors
schemas: [NO_ERRORS_SCHEMA]

// ✅ declare real child components and import required modules
declarations: [SearchComponent, SearchCriteriaComponent],
imports: [PortalCoreModule, ReactiveFormsModule, CalendarModule, DropdownModule, ...]
```

If a child component brings in too many transitive dependencies, extract the problematic child into its own spec file and test it in isolation.

#### Tests must reflect actual component state

Before writing a test for a feature (action, UI element, method, observable), **verify it exists in the current source**:

- Check the component's `.ts` file for public methods and dispatched actions before writing dispatch tests.
- Check the component's `.html` template for elements before writing template or harness-based tests.
- Check the NgRx actions file before testing action types or payloads.

This prevents tests for removed or never-implemented features (e.g., a diagram that was removed from the template, or methods that were renamed).

#### Inline Pipe mocks are forbidden

Do not mock `TranslatePipe` or any other pipe inline with a `@Pipe` decorator stub. Use `TranslateTestingModule.withTranslations('en', require(...))` instead — it provides real translation behavior without leaking mock state between tests.

Test selectors as pure functions using `.projector(...)` — no store setup required:

```typescript
it('should map DocumentType[] to SelectItem[]', () => {
  const types = [{ id: '1', name: 'Invoice' }];
  expect(selectDocumentTypes.projector(types)).toEqual([{ label: 'Invoice', value: '1' }]);
});
```

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

### Input Change Handling (`@Input`, setter, `OnChanges`)

Before adding input-change handling, first verify whether the component is the **single source of truth** for that data.

- If the component is the only place that can change the value (for example, local form state in a child component that is only emitted upward), do **not** add `OnChanges` and do not re-sync from `@Input` on every cycle.
- If an `@Input` can change from the parent and the component must react, prefer an **`@Input` setter** for focused, explicit reaction.
- Use `OnChanges` only in very well-justified cases where multiple inputs must be coordinated together or where a setter would be insufficient.

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
