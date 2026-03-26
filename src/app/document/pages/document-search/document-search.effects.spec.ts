import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  ExportDataService,
  PortalDialogService,
  PortalMessageService,
} from '@onecx/portal-integration-angular';
import { of, ReplaySubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { DocumentBffService } from '../../../shared/generated';
import { DocumentSearchActions } from './document-search.actions';
import { DocumentSearchEffects } from './document-search.effects';
import { DocumentSearchCriteria } from './document-search.parameters';
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
  let service: jest.Mocked<DocumentBffService>;
  let portalDialogService: jest.Mocked<PortalDialogService>;
  let messageService: jest.Mocked<PortalMessageService>;
  let exportDataService: jest.Mocked<ExportDataService>;

  const mockCriteria: DocumentSearchCriteria = { changeMe: 'test' } as any;

  beforeEach(async () => {
    actions$ = new ReplaySubject(1);

    service = {
      createDocument: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      searchDocuments: jest.fn(),
    } as unknown as jest.Mocked<DocumentBffService>;

    // compatibility aliases (featureName differs from resource)
    (service as any).createDocument = (service as any).createDocument;
    (service as any).updateDocument = (service as any).updateDocument;
    (service as any).deleteDocument = (service as any).deleteDocument;
    (service as any).searchDocuments = (service as any).searchDocuments;

    router = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      parseUrl: jest.fn(),
      events: of(),
    } as unknown as jest.Mocked<Router>;

    portalDialogService = {
      openDialog: jest.fn(),
    } as unknown as jest.Mocked<PortalDialogService>;

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
        { provide: DocumentBffService, useValue: service },
        { provide: PortalDialogService, useValue: portalDialogService },
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
        mockCriteria as any
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

  describe('searchByUrl$ / performSearch', () => {
    beforeEach(() => {
      store.overrideSelector(
        documentSearchSelectors.selectCriteria,
        mockCriteria as any
      );
      store.refreshState();

      service.searchDocuments.mockReturnValue(
        of({
          stream: [
            { id: '1', name: 'Item 1', description: '', imagePath: '' } as any,
          ],
          content: [
            { id: '1', name: 'Item 1', description: '', imagePath: '' } as any,
          ],
          size: 10,
          number: 0,
          totalElements: 1,
          totalPages: 1,
        } as any) as any
      );
    });

    it('should dispatch resultsLoadingFailed on search error', (done) => {
      const mockError = 'Search failed';
      service.searchDocuments.mockReturnValueOnce(
        throwError(() => mockError) as any
      );

      effects
        .performSearch(mockCriteria as any)
        .pipe(take(1))
        .subscribe((action) => {
          expect(action.type).toEqual(
            DocumentSearchActions.documentSearchResultsLoadingFailed.type
          );
          expect(action).toEqual(
            DocumentSearchActions.documentSearchResultsLoadingFailed({
              error: mockError,
            })
          );
          done();
        });
    });

    it('should convert Date objects in search criteria before calling service', (done) => {
      const criteriaWithDate: any = {
        ...mockCriteria,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };
      const searchSpy = jest.spyOn(service, 'searchDocuments');

      effects
        .performSearch(criteriaWithDate)
        .pipe(take(1))
        .subscribe(() => {
          expect(searchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              startDate: '2023-01-01T00:00:00.000Z',
              endDate: '2023-12-31T00:00:00.000Z',
            })
          );
          done();
        });
    });

    it('should use latest criteria from store and call performSearch on routerNavigatedAction', (done) => {
      const criteriaFromStore: any = { changeMe: 'fromStore' };
      store.overrideSelector(
        documentSearchSelectors.selectCriteria,
        criteriaFromStore as any
      );
      store.refreshState();

      const markerAction = { type: 'MARKER_ACTION' } as any;
      const performSearchSpy = jest
        .spyOn(effects, 'performSearch')
        .mockReturnValue(of(markerAction));

      effects.searchByUrl$.pipe(take(1)).subscribe((action) => {
        expect(performSearchSpy).toHaveBeenCalledWith(criteriaFromStore);
        expect(action).toBe(markerAction);
        done();
      });

      actions$.next({ type: routerNavigatedAction.type } as any);
    });
  });

  describe('exportData$', () => {
    const cases = [
      {
        desc: 'should handle export with empty displayed columns',
        viewModel: {
          results: [
            {
              id: '1',
              name: 'Context 1',
              description: 'Description 1',
              imagePath: '',
            } as any,
          ],
          resultComponentState: { displayedColumns: undefined },
        },
      },
      {
        desc: 'should handle export with null resultComponentState',
        viewModel: {
          results: [
            {
              id: '1',
              name: 'Context 1',
              description: 'Description 1',
              imagePath: '',
            } as any,
          ],
          resultComponentState: null,
        },
      },
    ];

    cases.forEach(({ desc, viewModel }) => {
      it(desc, (done) => {
        store.overrideSelector(selectDocumentSearchViewModel, viewModel as any);

        effects.exportData$.pipe(take(1)).subscribe(() => {
          expect(exportDataService.exportCsv).toHaveBeenCalledWith(
            [],
            viewModel.results,
            'Document.csv'
          );
          done();
        });

        actions$.next(DocumentSearchActions.exportButtonClicked());
      });
    });

    it('should export CSV with correct parameters when export button is clicked', (done) => {
      const mockColumns = [
        { field: 'name', header: 'Name' },
        { field: 'description', header: 'Description' },
      ];
      const mockResults = [
        { id: '1', name: 'Context 1', description: 'Description 1' } as any,
        { id: '2', name: 'Context 2', description: 'Description 2' } as any,
      ];
      const mockViewModel = {
        resultComponentState: { displayedColumns: mockColumns },
        results: mockResults,
      };
      store.overrideSelector(
        selectDocumentSearchViewModel,
        mockViewModel as any
      );

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

    it('should handle export with empty results', (done) => {
      const mockColumns = [
        { field: 'name', header: 'Name' },
        { field: 'description', header: 'Description' },
      ];
      const mockViewModel = {
        resultComponentState: { displayedColumns: mockColumns },
        results: [],
      };
      store.overrideSelector(
        selectDocumentSearchViewModel,
        mockViewModel as any
      );

      effects.exportData$.pipe(take(1)).subscribe(() => {
        expect(exportDataService.exportCsv).toHaveBeenCalledWith(
          mockColumns,
          [],
          'Document.csv'
        );
        done();
      });

      actions$.next(DocumentSearchActions.exportButtonClicked());
    });
  });

  describe('displayError$', () => {
    it('should display error message when ResultsLoadingFailed action is dispatched', (done) => {
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
  });

  describe('navigateToOrderDetailsPage$', () => {
    it('should navigate to details page with correct URL structure', (done) => {
      const testId = 'test-123';
      const navigateSpy = router
        ? jest.spyOn(router, 'navigate')
        : { mock: { calls: [] }, toHaveBeenCalledWith: () => {} };

      effects.navigateToOrderDetailsPage$.pipe(take(1)).subscribe(() => {
        if (router) {
          expect(navigateSpy).toHaveBeenCalledWith([
            '/search',
            'details',
            testId,
          ]);
        }
        done();
      });

      actions$.next(DocumentSearchActions.detailsButtonClicked({ id: testId }));
    });

    it('should dynamically clear query params and fragment from URL on navigateToOrderDetailsPage$', (done) => {
      const testId = 'test-456';
      const mockUrlTree: any = {
        toString: jest.fn(() => '/search'),
        queryParams: { a: 1 },
        fragment: 'frag',
      };
      (router.parseUrl as jest.Mock).mockReturnValue(mockUrlTree);

      const emissions: Array<{ queryParams: any; fragment: any }> = [];
      emissions.push({
        queryParams: { ...mockUrlTree.queryParams },
        fragment: mockUrlTree.fragment,
      });

      effects.navigateToOrderDetailsPage$.pipe(take(1)).subscribe(() => {
        emissions.push({
          queryParams: { ...mockUrlTree.queryParams },
          fragment: mockUrlTree.fragment,
        });

        expect(emissions).toEqual([
          { queryParams: { a: 1 }, fragment: 'frag' },
          { queryParams: {}, fragment: null },
        ]);
        done();
      });

      actions$.next(DocumentSearchActions.detailsButtonClicked({ id: testId }));
    });
  });

  // <<SPEC-EXTENSIONS-MARKER-!!!-DO-NOT-REMOVE-!!!>>
});
