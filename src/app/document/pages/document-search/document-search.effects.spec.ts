import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  ExportDataService,
  PortalMessageService,
} from '@onecx/portal-integration-angular';
import { of, ReplaySubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  DocumentControllerV1,
  DocumentTypeControllerV1,
} from '../../../shared/generated';
import { DocumentSearchActions } from './document-search.actions';
import { DocumentSearchEffects } from './document-search.effects';
import { DocumentSearchCriteriaSchema } from './document-search.parameters';
import { initialState } from './document-search.reducers';
import {
  documentSearchSelectors,
  selectDocumentSearchViewModel,
} from './document-search.selectors';

jest.mock('@onecx/ngrx-accelerator', () => {
  const actual = jest.requireActual('@onecx/ngrx-accelerator');
  return {
    ...actual,
    filterForNavigatedTo: () => (source: any) => source,
    filterOutQueryParamsHaveNotChanged: () => (source: any) => source,
  };
});

describe('DocumentSearchEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: DocumentSearchEffects;
  let store: MockStore<Store>;
  let router: jest.Mocked<Router>;
  let route: ActivatedRoute;
  let documentService: jest.Mocked<DocumentControllerV1>;
  let documentTypeService: jest.Mocked<DocumentTypeControllerV1>;
  let messageService: jest.Mocked<PortalMessageService>;
  let exportDataService: jest.Mocked<ExportDataService>;

  const mockCriteria: DocumentSearchCriteriaSchema = { name: 'test' };

  beforeEach(async () => {
    actions$ = new ReplaySubject(1);

    documentService = {
      getDocumentByCriteria: jest.fn(),
      getAllChannels: jest.fn(),
    } as unknown as jest.Mocked<DocumentControllerV1>;

    documentTypeService = {
      getAllTypesOfDocument: jest.fn(),
    } as unknown as jest.Mocked<DocumentTypeControllerV1>;

    router = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      parseUrl: jest.fn(),
      events: of(),
    } as unknown as jest.Mocked<Router>;

    messageService = {
      success: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<PortalMessageService>;

    exportDataService = {
      exportCsv: jest.fn(),
    } as unknown as jest.Mocked<ExportDataService>;

    route = {
      queryParams: of({}),
      snapshot: { queryParams: {} },
    } as unknown as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        DocumentSearchEffects,
        provideMockStore({
          initialState: { documentSearch: initialState },
        }),
        provideMockActions(() => actions$),
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: DocumentControllerV1, useValue: documentService },
        { provide: DocumentTypeControllerV1, useValue: documentTypeService },
        { provide: PortalMessageService, useValue: messageService },
        { provide: ExportDataService, useValue: exportDataService },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    effects = TestBed.inject(DocumentSearchEffects);
  });

  beforeEach(() => {
    jest.resetAllMocks();
    (router.parseUrl as jest.Mock).mockImplementation(
      (url: string) =>
        ({
          toString: () => (url ? url.split('?')[0].split('#')[0] : '/search'),
          queryParams: {},
          fragment: null,
        } as any)
    );
  });

  describe('syncParamsToUrl$', () => {
    beforeEach(() => {
      store.overrideSelector(
        documentSearchSelectors.selectCriteria,
        mockCriteria
      );
      store.refreshState();
    });

    it('should navigate to update URL when criteria differs from query params', (done) => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      route.queryParams = of({ different: 'yes' }) as any;

      effects.syncParamsToUrl$.pipe(take(1)).subscribe(() => {
        expect(navigateSpy).toHaveBeenCalled();
        done();
      });

      actions$.next(
        DocumentSearchActions.searchButtonClicked({
          searchCriteria: mockCriteria,
        })
      );
    });

    it('should not navigate when criteria matches query params', (done) => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      route.queryParams = of(mockCriteria as any) as any;

      effects.syncParamsToUrl$.pipe(take(1)).subscribe(() => {
        expect(navigateSpy).not.toHaveBeenCalled();
        done();
      });

      actions$.next(
        DocumentSearchActions.searchButtonClicked({
          searchCriteria: mockCriteria,
        })
      );
    });

    it('should navigate when resetButtonClicked action is triggered', (done) => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      route.queryParams = of({ something: 'else' }) as any;

      effects.syncParamsToUrl$.pipe(take(1)).subscribe(() => {
        expect(navigateSpy).toHaveBeenCalled();
        done();
      });

      actions$.next(DocumentSearchActions.resetButtonClicked());
    });
  });

  describe('searchByUrl$', () => {
    it('should dispatch loadAvailableCriteriaOptionsAndSearch when criteria options are not loaded', (done) => {
      store.overrideSelector(
        documentSearchSelectors.selectCriteria,
        mockCriteria
      );
      store.overrideSelector(
        documentSearchSelectors.selectCriteriaOptionsLoaded,
        false
      );
      store.refreshState();

      effects.searchByUrl$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentSearchActions.loadAvailableCriteriaOptionsAndSearch({
            criteria: mockCriteria,
          })
        );
        done();
      });

      actions$.next({ type: routerNavigatedAction.type } as any);
    });

    it('should dispatch performSearch when criteria options are already loaded', (done) => {
      store.overrideSelector(
        documentSearchSelectors.selectCriteria,
        mockCriteria
      );
      store.overrideSelector(
        documentSearchSelectors.selectCriteriaOptionsLoaded,
        true
      );
      store.refreshState();

      effects.searchByUrl$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentSearchActions.performSearch({ searchCriteria: mockCriteria })
        );
        done();
      });

      actions$.next({ type: routerNavigatedAction.type } as any);
    });
  });

  describe('loadCriteriaOptions$', () => {
    it('should call getAllChannels and getAllTypesOfDocument then dispatch three actions', (done) => {
      const channels = [{ id: 'ch1', name: 'Email' }];
      const types = [{ id: 't1', name: 'Invoice' }];
      documentService.getAllChannels.mockReturnValue(of(channels) as any);
      documentTypeService.getAllTypesOfDocument.mockReturnValue(
        of(types) as any
      );

      const dispatched: Action[] = [];
      effects.loadCriteriaOptions$.pipe(take(3)).subscribe({
        next: (action) => dispatched.push(action),
        complete: () => {
          expect(dispatched).toContainEqual(
            DocumentSearchActions.availableChannelsRecived({ channels })
          );
          expect(dispatched).toContainEqual(
            DocumentSearchActions.availableDocTypesRecived({ types })
          );
          expect(dispatched).toContainEqual(
            DocumentSearchActions.performSearch({
              searchCriteria: mockCriteria,
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentSearchActions.loadAvailableCriteriaOptionsAndSearch({
          criteria: mockCriteria,
        })
      );
    });
  });

  describe('performSearch$', () => {
    it('should dispatch documentSearchResultsReceived on success', (done) => {
      const stream = [{ id: '1', name: 'Doc A' }];
      documentService.getDocumentByCriteria.mockReturnValue(
        of({
          stream,
          size: 1,
          number: 0,
          totalElements: 1,
          totalPages: 1,
        }) as any
      );

      effects.performSearch$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentSearchActions.documentSearchResultsReceived({
            stream,
            size: 1,
            number: 0,
            totalElements: 1,
            totalPages: 1,
          })
        );
        done();
      });

      actions$.next(
        DocumentSearchActions.performSearch({ searchCriteria: mockCriteria })
      );
    });

    it('should convert Date fields to ISO strings before calling the API', (done) => {
      const criteriaWithDate = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };
      documentService.getDocumentByCriteria.mockReturnValue(
        of({
          stream: [],
          size: 0,
          number: 0,
          totalElements: 0,
          totalPages: 0,
        }) as any
      );

      effects.performSearch$.pipe(take(1)).subscribe(() => {
        expect(documentService.getDocumentByCriteria).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: '2023-01-01',
            endDate: '2023-12-31',
          })
        );
        done();
      });

      actions$.next(
        DocumentSearchActions.performSearch({
          searchCriteria: criteriaWithDate,
        })
      );
    });

    it('should dispatch documentSearchResultsLoadingFailed on API error', (done) => {
      const error = 'API failure';
      documentService.getDocumentByCriteria.mockReturnValue(
        throwError(() => error) as any
      );

      effects.performSearch$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentSearchActions.documentSearchResultsLoadingFailed({ error })
        );
        done();
      });

      actions$.next(
        DocumentSearchActions.performSearch({ searchCriteria: mockCriteria })
      );
    });
  });

  describe('exportData$', () => {
    it('should export CSV with correct columns and results', (done) => {
      const mockColumns = [{ field: 'name', header: 'Name' }];
      const mockResults = [{ id: '1', name: 'Context 1' } as any];
      store.overrideSelector(selectDocumentSearchViewModel, {
        resultComponentState: { displayedColumns: mockColumns },
        results: mockResults,
      } as any);

      effects.exportData$.pipe(take(1)).subscribe(() => {
        expect(exportDataService.exportCsv).toHaveBeenCalledWith(
          mockColumns,
          mockResults,
          'Document.csv'
        );
        done();
      });

      actions$.next(DocumentSearchActions.exportButtonClicked());
    });

    it('should pass empty array for columns when resultComponentState is null', (done) => {
      const mockResults = [{ id: '1', name: 'Context 1' } as any];
      store.overrideSelector(selectDocumentSearchViewModel, {
        resultComponentState: null,
        results: mockResults,
      } as any);

      effects.exportData$.pipe(take(1)).subscribe(() => {
        expect(exportDataService.exportCsv).toHaveBeenCalledWith(
          [],
          mockResults,
          'Document.csv'
        );
        done();
      });

      actions$.next(DocumentSearchActions.exportButtonClicked());
    });

    it('should pass empty array for columns when displayedColumns is undefined', (done) => {
      store.overrideSelector(selectDocumentSearchViewModel, {
        resultComponentState: { displayedColumns: undefined },
        results: [],
      } as any);

      effects.exportData$.pipe(take(1)).subscribe(() => {
        expect(exportDataService.exportCsv).toHaveBeenCalledWith(
          [],
          [],
          'Document.csv'
        );
        done();
      });

      actions$.next(DocumentSearchActions.exportButtonClicked());
    });
  });

  describe('displayError$', () => {
    it('should call messageService.error when documentSearchResultsLoadingFailed is dispatched', (done) => {
      effects.displayError$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).toHaveBeenCalled();
        done();
      });

      actions$.next(
        DocumentSearchActions.documentSearchResultsLoadingFailed({
          error: 'Test error',
        })
      );
    });

    it('should not call messageService.error for unrelated actions', (done) => {
      effects.displayError$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).not.toHaveBeenCalled();
        done();
      });

      actions$.next(DocumentSearchActions.resetButtonClicked());
    });
  });

  describe('navigateToOrderDetailsPage$', () => {
    it('should navigate to details page with id appended to current URL', (done) => {
      const testId = 'test-123';

      effects.navigateToOrderDetailsPage$.pipe(take(1)).subscribe(() => {
        expect(router.navigate).toHaveBeenCalledWith([
          '/search',
          'details',
          testId,
        ]);
        done();
      });

      actions$.next(DocumentSearchActions.detailsButtonClicked({ id: testId }));
    });

    it('should clear query params and fragment before navigating', (done) => {
      const testId = 'test-456';
      const mockUrlTree: any = {
        toString: jest.fn(() => '/search'),
        queryParams: { a: 1 },
        fragment: 'frag',
      };
      (router.parseUrl as jest.Mock).mockReturnValue(mockUrlTree);

      effects.navigateToOrderDetailsPage$.pipe(take(1)).subscribe(() => {
        expect(mockUrlTree.queryParams).toEqual({});
        expect(mockUrlTree.fragment).toBeNull();
        done();
      });

      actions$.next(DocumentSearchActions.detailsButtonClicked({ id: testId }));
    });
  });

  // <<SPEC-EXTENSIONS-MARKER-!!!-DO-NOT-REMOVE-!!!>>
});
