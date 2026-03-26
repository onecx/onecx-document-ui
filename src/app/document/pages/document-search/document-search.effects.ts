import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Action, Store } from '@ngrx/store';
import { filterForNavigatedTo } from '@onecx/ngrx-accelerator';
import {
  ExportDataService,
  PortalMessageService,
} from '@onecx/portal-integration-angular';
import equal from 'fast-deep-equal';
import { catchError, forkJoin, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { selectUrl } from 'src/app/shared/selectors/router.selectors';
import {
  DocumentControllerV1,
  DocumentTypeControllerV1,
} from '../../../shared/generated';
import { DocumentSearchActions } from './document-search.actions';
import { DocumentSearchComponent } from './document-search.component';
import { documentSearchCriteriasSchema } from './document-search.parameters';
import {
  documentSearchSelectors,
  selectDocumentSearchViewModel,
} from './document-search.selectors';

@Injectable()
export class DocumentSearchEffects {
  constructor(
    private actions$: Actions,
    private route: ActivatedRoute,
    private documentService: DocumentControllerV1,
    private router: Router,
    private store: Store,
    private messageService: PortalMessageService,
    private readonly exportDataService: ExportDataService,
    private readonly documentTypeService: DocumentTypeControllerV1
  ) {}

  syncParamsToUrl$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          DocumentSearchActions.searchButtonClicked,
          DocumentSearchActions.resetButtonClicked
        ),
        concatLatestFrom(() => [
          this.store.select(documentSearchSelectors.selectCriteria),
          this.route.queryParams,
        ]),
        tap(([, criteria, queryParams]) => {
          const results = documentSearchCriteriasSchema.safeParse(queryParams);
          if (!results.success || !equal(criteria, results.data)) {
            const params = {
              ...criteria,
              //TODO: Move to docs to explain how to only put the date part in the URL in case you have date and not datetime
              //exampleDate: criteria.exampleDate?.toISOString()?.slice(0, 10)
            };
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: params,
              replaceUrl: true,
              onSameUrlNavigation: 'ignore',
            });
          }
        })
      );
    },
    { dispatch: false }
  );

  navigateToOrderDetailsPage$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DocumentSearchActions.detailsButtonClicked),
        concatLatestFrom(() => this.store.select(selectUrl)),
        tap(([action, currentUrl]) => {
          const urlTree = this.router.parseUrl(currentUrl);
          urlTree.queryParams = {};
          urlTree.fragment = null;
          this.router.navigate([urlTree.toString(), 'details', action.id]);
        })
      );
    },
    { dispatch: false }
  );

  searchByUrl$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      filterForNavigatedTo(this.router, DocumentSearchComponent),
      // filterOutQueryParamsHaveNotChanged(
      //   this.router,
      //   documentSearchCriteriasSchema,
      //   false
      // ),
      concatLatestFrom(() => [
        this.store.select(documentSearchSelectors.selectCriteria),
        this.store.select(documentSearchSelectors.selectCriteriaOptionsLoaded),
      ]),
      map(([, searchCriteria, criteriaOptionsLoaded]) => {
        if (criteriaOptionsLoaded) {
          return DocumentSearchActions.performSearch({ searchCriteria });
        }
        return DocumentSearchActions.loadAvailableCriteriaOptionsAndSearch({
          criteria: searchCriteria,
        });
      })
    );
  });

  loadCriteriaOptions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentSearchActions.loadAvailableCriteriaOptionsAndSearch),
      switchMap((action) =>
        forkJoin([
          this.documentService.getAllChannels(),
          this.documentTypeService.getAllTypesOfDocument(),
        ]).pipe(
          mergeMap(([channels, documentTypes]) => [
            DocumentSearchActions.availableChannelsRecived({ channels }),
            DocumentSearchActions.availableDocTypesRecived({
              types: documentTypes,
            }),
            DocumentSearchActions.performSearch({
              searchCriteria: action.criteria,
            }),
          ])
        )
      )
    );
  });

  performSearch$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentSearchActions.performSearch),
      switchMap((action) => {
        return this.performSearch(action.searchCriteria);
      })
    );
  });

  exportData$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DocumentSearchActions.exportButtonClicked),
        concatLatestFrom(() =>
          this.store.select(selectDocumentSearchViewModel)
        ),
        map(([, viewModel]) => {
          this.exportDataService.exportCsv(
            viewModel.resultComponentState?.displayedColumns ?? [],
            viewModel.results,
            'Document.csv'
          );
        })
      );
    },
    { dispatch: false }
  );

  errorMessages: { action: Action; key: string }[] = [
    {
      action: DocumentSearchActions.documentSearchResultsLoadingFailed,
      key: 'DOCUMENT_SEARCH.ERROR_MESSAGES.SEARCH_RESULTS_LOADING_FAILED',
    },
  ];

  displayError$ = createEffect(
    () => {
      return this.actions$.pipe(
        tap((action) => {
          const e = this.errorMessages.find(
            (e) => e.action.type === action.type
          );
          if (e) {
            this.messageService.error({ summaryKey: e.key });
          }
        })
      );
    },
    { dispatch: false }
  );

  private performSearch(searchCriteria: Record<string, unknown>) {
    return this.documentService
      .getDocumentByCriteria({
        ...Object.entries(searchCriteria).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value instanceof Date ? value.toISOString() : value,
          }),
          {} as Record<string, unknown>
        ),
      })
      .pipe(
        map(({ stream, size, number, totalElements, totalPages }) =>
          DocumentSearchActions.documentSearchResultsReceived({
            stream: stream || [],
            size: size || 0,
            number: number || 0,
            totalElements: totalElements || 0,
            totalPages: totalPages || 0,
          })
        ),
        catchError((error) =>
          of(
            DocumentSearchActions.documentSearchResultsLoadingFailed({
              error,
            })
          )
        )
      );
  }
}
