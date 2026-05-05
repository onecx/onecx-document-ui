import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Action } from '@ngrx/store';
import { filterForNavigatedTo } from '@onecx/ngrx-accelerator';
import { PortalMessageService } from '@onecx/portal-integration-angular';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { DocumentTypeController } from '../../../shared/generated';
import { DocumentTypeSearchActions } from './document-type-search.actions';
import { DocumentTypeSearchComponent } from './document-type-search.component';

@Injectable()
export class DocumentTypeSearchEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly documentTypeService: DocumentTypeController,
    private readonly router: Router,
    private readonly messageService: PortalMessageService
  ) {}

  loadOnNavigation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      filterForNavigatedTo(this.router, DocumentTypeSearchComponent),
      map(() => DocumentTypeSearchActions.loadDocumentTypesTriggered())
    );
  });

  loadDocumentTypes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentTypeSearchActions.loadDocumentTypesTriggered),
      switchMap(() =>
        this.documentTypeService.getAllTypesOfDocument().pipe(
          map((documentTypes) =>
            DocumentTypeSearchActions.documentTypesReceived({ documentTypes })
          ),
          catchError((error) =>
            of(
              DocumentTypeSearchActions.documentTypesLoadingFailed(error)
            )
          )
        )
      )
    );
  });

  createDocumentType$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentTypeSearchActions.createDocumentTypeButtonClicked),
      switchMap(({ name, description, activeStatus }) =>
        this.documentTypeService
          .createDocumentType({ name, description, activeStatus })
          .pipe(
            map((documentType) =>
              DocumentTypeSearchActions.documentTypeCreated({ documentType })
            ),
            catchError((error) =>
              of(
                DocumentTypeSearchActions.documentTypeCreationFailed(error)
              )
            )
          )
      )
    );
  });

  updateDocumentType$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentTypeSearchActions.updateDocumentTypeButtonClicked),
      switchMap(({ id, name, description, activeStatus }) =>
        this.documentTypeService
          .updateDocumentTypeById(id, { name, description, activeStatus })
          .pipe(
            map((documentType) =>
              DocumentTypeSearchActions.documentTypeUpdated({ documentType })
            ),
            catchError((error) =>
              of(
                DocumentTypeSearchActions.documentTypeUpdateFailed(error)
              )
            )
          )
      )
    );
  });

  deleteDocumentType$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentTypeSearchActions.deleteDocumentTypeButtonClicked),
      switchMap(({ id }) =>
        this.documentTypeService.deleteDocumentTypeById(id).pipe(
          map(() => DocumentTypeSearchActions.documentTypeDeleted({ id })),
          catchError((error) =>
            of(
              DocumentTypeSearchActions.documentTypeDeletionFailed(error)
            )
          )
        )
      )
    );
  });

  errorMessages: { action: Action; key: string }[] = [
    {
      action: DocumentTypeSearchActions.documentTypesLoadingFailed,
      key: 'DOCUMENT_TYPE_SEARCH.ERROR_MESSAGES.LOAD_FAILED',
    },
    {
      action: DocumentTypeSearchActions.documentTypeCreationFailed,
      key: 'DOCUMENT_TYPE_SEARCH.ERROR_MESSAGES.CREATE_FAILED',
    },
    {
      action: DocumentTypeSearchActions.documentTypeUpdateFailed,
      key: 'DOCUMENT_TYPE_SEARCH.ERROR_MESSAGES.UPDATE_FAILED',
    },
    {
      action: DocumentTypeSearchActions.documentTypeDeletionFailed,
      key: 'DOCUMENT_TYPE_SEARCH.ERROR_MESSAGES.DELETE_FAILED',
    },
  ];

  successMessages: { action: Action; key: string }[] = [
    {
      action: DocumentTypeSearchActions.documentTypeCreated,
      key: 'DOCUMENT_TYPE_SEARCH.SUCCESS_MESSAGES.CREATE_SUCCESS',
    },
    {
      action: DocumentTypeSearchActions.documentTypeUpdated,
      key: 'DOCUMENT_TYPE_SEARCH.SUCCESS_MESSAGES.UPDATE_SUCCESS',
    },
    {
      action: DocumentTypeSearchActions.documentTypeDeleted,
      key: 'DOCUMENT_TYPE_SEARCH.SUCCESS_MESSAGES.DELETE_SUCCESS',
    },
  ];

  displayError$ = createEffect(
    () => {
      return this.actions$.pipe(
        tap((action) => {
          const entry = this.errorMessages.find(
            (e) => e.action.type === action.type
          );
          if (entry) {
            this.messageService.error({ summaryKey: entry.key });
          }
        })
      );
    },
    { dispatch: false }
  );

  displaySuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        tap((action) => {
          const entry = this.successMessages.find(
            (e) => e.action.type === action.type
          );
          if (entry) {
            this.messageService.success({ summaryKey: entry.key });
          }
        })
      );
    },
    { dispatch: false }
  );
}
