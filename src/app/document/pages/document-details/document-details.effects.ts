import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Action, Store } from '@ngrx/store';
import { filterForNavigatedTo } from '@onecx/ngrx-accelerator';
import {
  DialogState,
  PortalDialogService,
  PortalMessageService,
} from '@onecx/portal-integration-angular';
import { PrimeIcons } from 'primeng/api';
import { catchError, filter, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { selectBackNavigationPossible } from 'src/app/shared/selectors/onecx.selectors';
import {
  selectRouteParam,
  selectUrl,
} from 'src/app/shared/selectors/router.selectors';
import {
  Attachment,
  AttachmentCreateUpdate,
  DocumentCharacteristicCreateUpdate,
  DocumentControllerV1,
  DocumentCreateUpdate,
  DocumentDetail,
  LifeCycleState,
  UploadAttachmentPresignedUrlRequest,
} from '../../../shared/generated';
import { DocumentDetailsActions } from './document-details.actions';
import { DocumentDetailsComponent } from './document-details.component';
import {
  documentDetailsSelectors,
  selectDocumentDetailsViewModel,
} from './document-details.selectors';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import { ExternalFileHandlerService } from '../../service/external-file-handler.service';
import {
  AttachmentFile,
  DocumentAttachmentFormValue,
  DocumentCharacteristicFormValue,
  DocumentDetailsFormValue,
} from '../../types/document-create.types';
import { RetryFileUploadDialogComponent } from './dialog/retry-file-upload-dialog/retry-file-upload-dialog.component';

@Injectable()
export class DocumentDetailsEffects {
  constructor(
    private actions$: Actions,
    private documentService: DocumentControllerV1,
    private router: Router,
    private store: Store,
    private messageService: PortalMessageService,
    private portalDialogService: PortalDialogService,
    private fileHandlerService: ExternalFileHandlerService
  ) {}

  navigatedToDetailsPage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      filterForNavigatedTo(this.router, DocumentDetailsComponent),
      concatLatestFrom(() => this.store.select(selectRouteParam('id'))),
      mergeMap(([, id]) => {
        return [
          DocumentCreateOperationsActions.ensureReferenceDataLoaded(),
          DocumentDetailsActions.navigatedToDetailsPage({
            id,
          }),
        ];
      })
    );
  });

  loadDocumentById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentDetailsActions.navigatedToDetailsPage),
      switchMap(({ id }) =>
        this.documentService.getDocumentDetailById(id ?? '').pipe(
          map((details) =>
            DocumentDetailsActions.documentDetailsReceived({
              details,
            })
          ),
          catchError((error) =>
            of(
              DocumentDetailsActions.documentDetailsLoadingFailed({
                error,
              })
            )
          )
        )
      )
    );
  });

  cancelButtonNotDirty$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentDetailsActions.cancelButtonClicked),
      filter((action) => !action.dirty),
      map(() => {
        return DocumentDetailsActions.cancelEditNotDirty();
      })
    );
  });

  cancelButtonClickedDirty$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentDetailsActions.cancelButtonClicked),
      filter((action) => action.dirty),
      switchMap(() => {
        return this.portalDialogService.openDialog<DocumentDetail | undefined>(
          'DOCUMENT_DETAILS.CANCEL.HEADER',
          'DOCUMENT_DETAILS.CANCEL.MESSAGE',
          'DOCUMENT_DETAILS.CANCEL.CONFIRM'
        );
      }),
      switchMap((dialogResult) => {
        if (!dialogResult || dialogResult.button == 'secondary') {
          return of(DocumentDetailsActions.cancelEditBackClicked());
        }
        return of(DocumentDetailsActions.cancelEditConfirmClicked());
      })
    );
  });

  saveButtonClicked$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentDetailsActions.saveButtonClicked),
      concatLatestFrom(() =>
        this.store.select(documentDetailsSelectors.selectDetails)
      ),
      switchMap(([{ details }, prevDetails]) => {
        const itemToEditId = prevDetails?.id;

        if (!itemToEditId) {
          return of(DocumentDetailsActions.updateDocumentCancelled());
        }
        const itemToEdit = this.getUpdateRequest(prevDetails, details);
        return this.documentService
          .updateDocumentDetail(itemToEditId, itemToEdit)
          .pipe(
            mergeMap((response) => [
              DocumentDetailsActions.updateDocumentSucceeded(),
              DocumentDetailsActions.documentDetailsReceived({
                details: response,
              }),
            ]),
            catchError((error) => {
              this.messageService.error({
                summaryKey: 'DOCUMENT_DETAILS.UPDATE.ERROR',
              });
              return of(
                DocumentDetailsActions.updateDocumentFailed({
                  error,
                })
              );
            })
          );
      })
    );
  });

  updateSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DocumentDetailsActions.updateDocumentSucceeded),
        tap(() =>
          this.messageService.success({
            summaryKey: 'DOCUMENT_DETAILS.UPDATE.SUCCESS',
          })
        )
      );
    },
    { dispatch: false }
  );

  deleteButtonClicked$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentDetailsActions.deleteButtonClicked),
      concatLatestFrom(() =>
        this.store.select(documentDetailsSelectors.selectDetails)
      ),
      mergeMap(([, itemToDelete]) => {
        return this.portalDialogService
          .openDialog<unknown>(
            'DOCUMENT_DETAILS.DELETE.HEADER',
            'DOCUMENT_DETAILS.DELETE.MESSAGE',
            {
              key: 'DOCUMENT_DETAILS.DELETE.CONFIRM',
              icon: PrimeIcons.CHECK,
            },
            {
              key: 'DOCUMENT_DETAILS.DELETE.CANCEL',
              icon: PrimeIcons.TIMES,
            }
          )
          .pipe(
            map((state): [DialogState<unknown>, DocumentDetail | undefined] => {
              return [state, itemToDelete];
            })
          );
      }),
      switchMap(([dialogResult, itemToDelete]) => {
        if (!dialogResult || dialogResult.button == 'secondary') {
          return of(DocumentDetailsActions.deleteDocumentCancelled());
        }
        if (!itemToDelete) {
          throw new Error('Item to delete not found!');
        }

        return this.documentService.deleteDocumentDetail(itemToDelete.id!).pipe(
          map(() => {
            this.messageService.success({
              summaryKey: 'DOCUMENT_DETAILS.DELETE.SUCCESS',
            });
            return DocumentDetailsActions.deleteDocumentSucceeded();
          }),
          catchError((error) => {
            this.messageService.error({
              summaryKey: 'DOCUMENT_DETAILS.DELETE.ERROR',
            });
            return of(
              DocumentDetailsActions.deleteDocumentFailed({
                error,
              })
            );
          })
        );
      })
    );
  });

  deleteDocumentSucceeded$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DocumentDetailsActions.deleteDocumentSucceeded),
        concatLatestFrom(() => this.store.select(selectUrl)),
        tap(([, currentUrl]) => {
          const urlTree = this.router.parseUrl(currentUrl);
          urlTree.queryParams = {};
          urlTree.fragment = null;

          const targetUrl = urlTree
            .toString()
            .split('/')
            .slice(0, -2)
            .join('/');
          this.router.navigate([targetUrl]);
        })
      );
    },
    { dispatch: false }
  );

  startAttachmentDownload$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentDetailsActions.startAttachmentDownload),
      switchMap((action) =>
        this.documentService.getFile(action.attachmentId).pipe(
          map((response) =>
            DocumentDetailsActions.downloadAttachmentBlob({
              urlResponse: response,
              fileName: action.fileName,
            })
          ),
          catchError(() =>
            of(DocumentDetailsActions.attachmentDownloadFailed())
          )
        )
      )
    );
  });

  downloadAttachmentBlob$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentDetailsActions.downloadAttachmentBlob),
      switchMap((action) =>
        this.fileHandlerService.downloadFile(action.urlResponse).pipe(
          map((fileBlob) =>
            DocumentDetailsActions.saveDownloadedAttachment({
              file: fileBlob,
              fileName: action.fileName,
            })
          ),
          catchError(() =>
            of(DocumentDetailsActions.attachmentDownloadFailed())
          )
        )
      )
    );
  });

  saveDownloadAttachment$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DocumentDetailsActions.saveDownloadedAttachment),
        tap(({ file, fileName }) => this.saveDownloadedFile(file, fileName))
      );
    },
    { dispatch: false }
  );

  errorMessages: { action: Action; key: string }[] = [
    {
      action: DocumentDetailsActions.documentDetailsLoadingFailed,
      key: 'DOCUMENT_DETAILS.ERROR_MESSAGES.DETAILS_LOADING_FAILED',
    },
    {
      action: DocumentDetailsActions.attachmentDownloadFailed,
      key: 'DOCUMENT_DETAILS.ERROR_MESSAGES.ATTACHMENT_DOWNLOAD_FAILED',
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

  navigateBack$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentDetailsActions.navigateBackButtonClicked),
      concatLatestFrom(() => [this.store.select(selectBackNavigationPossible)]),
      switchMap(([, backNavigationPossible]) => {
        if (!backNavigationPossible) {
          return of(DocumentDetailsActions.backNavigationFailed());
        }
        window.history.back();
        return of(DocumentDetailsActions.backNavigationStarted());
      })
    );
  });

  retryFileUpload$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentDetailsActions.retryFileUpload),
      concatLatestFrom(() => this.store.select(selectDocumentDetailsViewModel)),
      switchMap(([action, { details }]) => {
        return this.portalDialogService
          .openDialog<File | null>(
            'DOCUMENT_DETAILS.DIALOGS.RETRY_FILE_UPLOAD.TITLE',
            {
              type: RetryFileUploadDialogComponent,
              inputs: { fileName: action.fileName },
            },
            'DOCUMENT_DETAILS.DIALOGS.RETRY_FILE_UPLOAD.SAVE_BTN',
            undefined,
            { showXButton: true, width: '40vw' }
          )
          .pipe(
            map((dialogResult) => {
              if (
                !dialogResult ||
                dialogResult.button !== 'primary' ||
                !dialogResult.result
              ) {
                return DocumentDetailsActions.retryFileUploadCanceled();
              }
              const fileToUpload = dialogResult.result;
              const urlRequest: UploadAttachmentPresignedUrlRequest[] = [
                {
                  fileName: action.fileName,
                  attachmentId: action.attachmentId,
                },
              ];
              const files: AttachmentFile[] = [
                {
                  attachmentId: action.attachmentId,
                  file: fileToUpload,
                  fileName: action.fileName,
                },
              ];
              return DocumentCreateOperationsActions.requestDocumentUploadUrls({
                createdDocument: details!,
                uploadRequests: urlRequest,
                files,
              });
            })
          );
      })
    );
  });

  documentCreationSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DocumentCreateOperationsActions.documentCreationCompleted),
      concatLatestFrom(() => this.store.select(selectDocumentDetailsViewModel)),
      filter(([action, vm]) => action.documentId === vm.details?.id),
      map(([action]) =>
        DocumentDetailsActions.navigatedToDetailsPage({ id: action.documentId })
      )
    );
  });

  private saveDownloadedFile(blob: Blob, fileName: string) {
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
  }

  private getUpdateRequest(
    prevState: DocumentDetail,
    formValue: DocumentDetailsFormValue
  ): DocumentCreateUpdate {
    void formValue;

    return {
      modificationCount: prevState.modificationCount,
      creationDate: prevState.creationDate,
      creationUser: prevState.creationUser,
      modificationDate: prevState.modificationDate,
      modificationUser: prevState.modificationUser,
      id: prevState.id,
      name: formValue.name!,
      description: prevState.description,
      lifeCycleState: formValue.status as LifeCycleState,
      documentVersion: formValue.version || undefined,
      tags: [],
      typeId: formValue.type!,
      specification: prevState.specification
        ? {
            name: formValue.specification || undefined,
            specificationVersion: prevState.specification.specificationVersion,
          }
        : undefined,
      channel: {
        id: prevState.channel?.id,
        name: formValue.channel!,
      },
      documentRelationships: (prevState.documentRelationships
        ? Array.from(prevState.documentRelationships)
        : []
      ).map((relationship) => ({
        id: relationship.id,
        type: relationship.type,
        documentRefId: relationship.documentRefId,
      })),
      characteristics: this.mapCharacteristics(formValue.characteristics),
      relatedParties: (prevState.relatedParties
        ? Array.from(prevState.relatedParties)
        : []
      ).map((relatedParty) => ({
        id: relatedParty.id,
        name: relatedParty.name,
        role: relatedParty.role,
        validFor: relatedParty.validFor,
      })),
      relatedObject: prevState.relatedObject
        ? {
            id: prevState.relatedObject.id,
            involvement: formValue.involvement || undefined,
            objectReferenceType: formValue.objectReferenceType || undefined,
            objectReferenceId: formValue.objectReferenceId || undefined,
          }
        : undefined,
      categories: (prevState.categories
        ? Array.from(prevState.categories)
        : []
      ).map((category) => ({
        id: category.id,
        name: category.name,
        categoryVersion: category.categoryVersion,
      })),
      attachments: this.mapAttachments(
        prevState.attachments || [],
        formValue.attachments
      ),
    };
  }

  private mapAttachments(
    prevAttachments: Attachment[],
    formValue: DocumentAttachmentFormValue[]
  ): AttachmentCreateUpdate[] {
    const attachmentMap = formValue.reduce((prev, curr) => {
      prev[curr.id!] = curr;
      return prev;
    }, {} as Record<string, DocumentAttachmentFormValue>);
    return prevAttachments.map((attachment) => {
      const attachmentFormValue = attachmentMap[attachment.id!];
      return {
        id: attachment.id,
        name: attachmentFormValue.name!,
        description: attachmentFormValue.description!,
        type: attachment.type,
        validFor: attachment.validFor,
        mimeTypeId: attachment.mimeType?.id,
        fileName: attachment.fileName,
      };
    });
  }

  private mapCharacteristics(
    formValue: DocumentCharacteristicFormValue[]
  ): DocumentCharacteristicCreateUpdate[] {
    return formValue.map((val) => ({
      id: val.id || undefined,
      name: val.name!,
      value: val.value!,
    }));
  }
}
